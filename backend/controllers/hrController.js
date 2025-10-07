import Employee from '../models/Employee.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

export const createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    
    logger.info(`Employee created: ${employee._id}`);
    res.status(201).json({ success: true, data: employee, message: 'Empleado creado exitosamente' });
  } catch (error) {
    logger.error('Error creating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { status, department, search, page = 1, limit = 20 } = req.query;
    const query = { isDeleted: false };

    if (status) query['employment.status'] = status;
    if (department) query['employment.department'] = department;
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': new RegExp(search, 'i') },
        { 'personalInfo.lastName': new RegExp(search, 'i') },
        { 'personalInfo.identificationNumber': new RegExp(search, 'i') },
        { employeeNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const employees = await Employee.find(query)
      .populate('user', 'name email')
      .sort({ 'employment.hireDate': -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: employees,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    logger.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empleados' });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email')
      .populate('performance.reviews.reviewedBy', 'name')
      .populate('notes.createdBy', 'name');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    logger.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empleado' });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) employee[key] = req.body[key];
    });

    await employee.save();
    res.json({ success: true, data: employee, message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    logger.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    await employee.softDelete(req.user._id);
    res.json({ success: true, message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting employee:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
  }
};

export const terminateEmployee = async (req, res) => {
  try {
    const { reason } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    await employee.terminate(reason, req.user._id);
    logger.info(`Employee terminated: ${employee._id}`);
    res.json({ success: true, data: employee, message: 'Empleado terminado exitosamente' });
  } catch (error) {
    logger.error('Error terminating employee:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPerformanceReview = async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }

    employee.performance.reviews.push({
      date: new Date(),
      rating,
      comments,
      reviewedBy: req.user._id
    });

    await employee.save();
    res.json({ success: true, data: employee, message: 'Evaluación agregada exitosamente' });
  } catch (error) {
    logger.error('Error adding review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const total = await Employee.countDocuments({ isDeleted: false });
    const active = await Employee.countDocuments({ 'employment.status': 'active', isDeleted: false });
    const inactive = await Employee.countDocuments({ 'employment.status': { $ne: 'active' }, isDeleted: false });

    const byDepartment = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$employment.department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { total, active, inactive, byDepartment }
    });
  } catch (error) {
    logger.error('Error fetching employee stats:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export default {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  terminateEmployee,
  addPerformanceReview,
  getEmployeeStats
};
