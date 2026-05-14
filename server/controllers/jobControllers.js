import DesignConcept from "../schema/designConceptSchema.js";
import Job from "../schema/jobSchema";
export const requestJob = async (req, res) => {
  try {
    const customerId = req.user._id;
    const designConcept = await DesignConcept.findOne({
      jobId: req.body.designConcept,
    });
    if (!designConcept) {
      return res
        .status(400)
        .json({ success: false, message: "Design concept not found" });
    }
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authorized" });
    }
    const {
      category,
      description,
      timingPreference,
      budget,
      budgetType,
      budgetMin,
      budgetMax,
      postCode,
      photos,
    } = req.body;
    if (!category || !description || !timingPreference) {
      return res.status(400).json({
        success: false,
        message: "Please fill in the required filled ",
      });
    }
    const job = await Job.create({
      customerId,
      category,
      description,
      timingPreference,
      budget,
      budgetType,
      budgetMin,
      budgetMax,
      postCode,
      designConcept,
      photos,
    });
    const jobDetails = await Job.findById(job._id).populate("designConcept");
    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: jobDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
    console.log(error.message);
  }
};
export const fetchJobs = async (req, res) => {
  try {
    const customerId = req.user._id;
    const status = req.query.status;
    const jobs = [];
    status
      ? (jobs = await Job.find({ customerId, status }).populate(
          "designConcept",
        ))
      : (jobs = await Job.find({ customerId }).populate("designConcept"));
    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: "No jobs found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Jobs fetched successfully", jobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
    console.log(error.message);
  }
};

export const fetchJobsById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const customerId = req.user._id;
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authorized" });
    }
    const job = await Job.findOne({ _id: jobId, customerId }).populate(
      "designConcept",
    );
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Job fetched successfully", job: job });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
    console.log(error.message);
  }
};
