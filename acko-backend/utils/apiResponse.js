class ApiResponse {
    constructor(success, message, data = null, statusCode = 200) {
        this.success = success
        this.message = message
        this.data = data
        this.statusCode = statusCode
    }

    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            data: this.data
        })
    }
}

class SuccessResponse extends ApiResponse {
    constructor(message, data = null, statusCode = 200) {
        super(true, message, data, statusCode)
    }
}

class ErrorResponse extends ApiResponse {
    constructor(message, error = null, statusCode = 400) {
        super(false, message, null, statusCode)
        this.error = error
    }

    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            error: this.error
        })
    }
}

module.exports = { SuccessResponse, ErrorResponse }