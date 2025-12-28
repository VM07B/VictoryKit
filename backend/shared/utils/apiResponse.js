class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp
    };
  }
}

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json(ApiResponse.success(data, message, statusCode));
};

const sendCreated = (res, data, message = 'Created successfully') => {
  return res.status(201).json(ApiResponse.created(data, message));
};

const sendNoContent = (res, message = 'No content') => {
  return res.status(204).json(ApiResponse.noContent(message));
};

module.exports = {
  ApiResponse,
  sendSuccess,
  sendCreated,
  sendNoContent
};
