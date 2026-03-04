import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export async function testJobDrivesAPI() {
  console.log('🔍 Testing Job Drives API...\n');

  try {
    // Test 1: Get all job drives
    console.log('📨 REQUEST 1: GET /api/drives');
    const drivesRes = await axios.get(`${API_BASE}/api/drives`);
    console.log(`✅ Response Status: ${drivesRes.status}`);
    console.log(`📊 Drives Returned: ${drivesRes.data.data?.length || 0}`);
    
    if (drivesRes.data.data && drivesRes.data.data.length > 0) {
      console.log('\n🔎 First Drive Sample:');
      const d = drivesRes.data.data[0];
      console.log(`  ID: ${d._id}`);
      console.log(`  Position: ${d.position}`);
      console.log(`  Company: ${d.company}`);
      console.log(`  Status: ${d.status}`);
      console.log(`  Salary: ${d.salary}`);
      console.log(`  Location: ${d.location}`);
      console.log(`  Recruiter ID: ${d.recruiterId}`);
    }

    return drivesRes.data.data || [];
  } catch (err) {
    console.error('❌ API Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    return [];
  }
}

// Export for use in Student pages
export async function initializeJobDrivesDebug() {
  const drives = await testJobDrivesAPI();
  
  return {
    drives,
    stats: {
      total: drives.length,
      active: drives.filter(d => d.status === 'active').length,
      blocked: drives.filter(d => d.status === 'blocked' || d.isBlocked).length,
      deleted: drives.filter(d => d.status === 'deleted' || d.isDeleted).length,
    }
  };
}
