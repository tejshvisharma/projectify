import apiResponse from "../utils/api-response.js"

const healthCheck = (req, res) => {
    const response = new apiResponse(200, null, "API is healthy ✅");
    return res.status(response.statuscode).json(response);
};

export {healthCheck}  
