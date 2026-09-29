require('dotenv').config();
const mongoose = require('mongoose');
const StaffUser = require('../models/StaffUser');
const Appointment = require('../models/Appointment');
const DoctorAssignment = require('../models/DoctorAssignment');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the real doctor we just provisioned
    const realDoctor = await StaffUser.findOne({ firebaseUid: 'eDNTEbCUdbfLETqIfX0Y0IDhuQn2' });
    if (!realDoctor) throw new Error("Real doctor not found. Did provisioning fail?");
    
    // Find the dummy doctor
    const dummyDoctor = await StaffUser.findOne({ firebaseUid: 'demo-doctor-uid-12345' });
    if (dummyDoctor) {
      console.log('Re-assigning appointments from dummy doctor to real doctor...');
      await Appointment.updateMany(
        { doctorId: dummyDoctor._id },
        { $set: { doctorId: realDoctor._id, doctorName: realDoctor.displayName } }
      );
      
      console.log('Re-assigning patients...');
      await DoctorAssignment.updateMany(
        { doctorId: dummyDoctor._id },
        { $set: { doctorId: realDoctor._id } }
      );
      
      console.log('Deleting dummy doctor...');
      await StaffUser.deleteOne({ _id: dummyDoctor._id });
    }
    
    console.log('Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
