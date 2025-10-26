const fetch = require('node-fetch');

async function testFeatures() {
  try {
    console.log('🔍 Testing features loading...');
    
    // Test API endpoint
    const response = await fetch('http://localhost:3000/api/vendor/venues/3/features', {
      headers: {
        'Cookie': 'session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsInNlc3Npb25JZCI6IjE3Mjg1OTQ0MDAwMDAiLCJpYXQiOjE3Mjg1OTQ0MDB9.WTyCbXfJsiTsnDNlWHoTDW9qiJXR1UKzid9L1KmuhMCRQKmf5BK7J0rpHGmRhMIktVhjmZ'
      }
    });
    
    const data = await response.json();
    console.log('🔍 API Response:', JSON.stringify(data, null, 2));
    
    // Test adding a new feature
    console.log('\n🔍 Testing feature addition...');
    const newFeature = {
      features: [
        ...data.features,
        {
          id: `feature_${Date.now()}`,
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          text: 'Тестовая особенность'
        }
      ]
    };
    
    const saveResponse = await fetch('http://localhost:3000/api/vendor/venues/3/features', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsInNlc3Npb25JZCI6IjE3Mjg1OTQ0MDAwMDAiLCJpYXQiOjE3Mjg1OTQ0MDB9.WTyCbXfJsiTsnDNlWHoTDW9qiJXR1UKzid9L1KmuhMCRQKmf5BK7J0rpHGmRhMIktVhjmZ'
      },
      body: JSON.stringify(newFeature)
    });
    
    const saveData = await saveResponse.json();
    console.log('🔍 Save Response:', JSON.stringify(saveData, null, 2));
    
    // Test loading again
    console.log('\n🔍 Testing features loading after save...');
    const response2 = await fetch('http://localhost:3000/api/vendor/venues/3/features', {
      headers: {
        'Cookie': 'session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsInNlc3Npb25JZCI6IjE3Mjg1OTQ0MDAwMDAiLCJpYXQiOjE3Mjg1OTQ0MDB9.WTyCbXfJsiTsnDNlWHoTDW9qiJXR1UKzid9L1KmuhMCRQKmf5BK7J0rpHGmRhMIktVhjmZ'
      }
    });
    
    const data2 = await response2.json();
    console.log('🔍 API Response after save:', JSON.stringify(data2, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFeatures();
