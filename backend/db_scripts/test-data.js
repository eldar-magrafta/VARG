// test-data.js - Script to insert test report data
const { db, userQueries, reportQueries } = require('../utils/database');

const testReport1 = `**INCIDENT REPORT**

**REPORT TYPE:**
General Incident Report

**INCIDENT DATE:**
2024-06-24

**INCIDENT TIME:**
14:30

**LOCATION:**
123 Main Street, Tel Aviv, Israel

**REPORTING OFFICER:**
Officer John Smith

**BADGE NUMBER:**
Badge #1234

**INCIDENT CLASSIFICATION:**
Traffic Stop

**WEATHER/ENVIRONMENTAL CONDITIONS:**
Clear skies, good visibility, daytime conditions

**INDIVIDUALS INVOLVED:**
Driver: Male, approximately 30 years old, wearing blue shirt
Vehicle: White Toyota Camry, License plate 123-456-789

**INCIDENT NARRATIVE:**
Routine traffic stop conducted for speeding violation on Main Street. Driver was cooperative and provided valid documentation. Citation issued for exceeding speed limit by 15 mph in a 50 mph zone.

**OFFICER ACTIONS AND PROCEDURES:**
1. Initiated traffic stop with emergency lights
2. Approached vehicle and identified myself
3. Requested driver license and registration
4. Ran license check through dispatch
5. Issued citation for speeding violation
6. Released driver with warning about safe driving

**EVIDENCE AND DOCUMENTATION:**
Body camera footage recorded throughout encounter
Citation #SC-2024-001 issued
Driver license information verified

**COMPLETE AUDIO TRANSCRIPT:**
[14:30:15] Officer: "Good afternoon, I pulled you over for speeding. License and registration please."
[14:30:45] Driver: "Yes officer, here you go. Was I really speeding?"
[14:31:00] Officer: "Yes sir, I clocked you at 65 in a 50 zone. Please wait while I run your information."
[14:33:20] Officer: "Here is your citation. Please drive safely and have a good day."`;

const testReport2 = `**INCIDENT REPORT**

**REPORT TYPE:**
Crime Report

**INCIDENT DATE:**
2024-06-23

**INCIDENT TIME:**
22:15

**LOCATION:**
456 Oak Avenue, Tel Aviv, Israel

**REPORTING OFFICER:**
Officer Jane Doe

**BADGE NUMBER:**
Badge #5678

**INCIDENT CLASSIFICATION:**
Theft Report

**WEATHER/ENVIRONMENTAL CONDITIONS:**
Night time, street lighting adequate, no precipitation

**INDIVIDUALS INVOLVED:**
Victim: Sarah Cohen, 28 years old, resident of 456 Oak Avenue
Witness: David Miller, 35 years old, neighbor

**INCIDENT NARRATIVE:**
Responded to report of bicycle theft from apartment building courtyard. Victim states bicycle was secured with cable lock at approximately 18:00 hours. Upon return at 22:00, bicycle and lock were missing. No surveillance cameras in area.

**OFFICER ACTIONS AND PROCEDURES:**
1. Interviewed victim and obtained statement
2. Examined scene for evidence
3. Interviewed witness who heard suspicious noises around 20:30
4. Completed theft report form
5. Provided victim with case number for insurance purposes

**EVIDENCE AND DOCUMENTATION:**
Photos of lock cutting marks on bike rack
Victim statement form completed
Case #2024-TH-089 assigned

**COMPLETE AUDIO TRANSCRIPT:**
[22:15:30] Officer: "Good evening, I understand you want to report a stolen bicycle?"
[22:15:45] Victim: "Yes, my bike was locked right here this afternoon and now its gone."
[22:16:10] Officer: "Can you describe the bicycle and when you last saw it?"
[22:16:25] Victim: "It was a red mountain bike, Trek brand, I locked it here around 6 PM."`;

const testReport3 = `**INCIDENT REPORT**

**REPORT TYPE:**
Vehicle Accident Report

**INCIDENT DATE:**
2024-06-22

**INCIDENT TIME:**
16:45

**LOCATION:**
Intersection of Ben Yehuda St and Dizengoff St, Tel Aviv

**REPORTING OFFICER:**
Officer Michael Brown

**BADGE NUMBER:**
Badge #9999

**INCIDENT CLASSIFICATION:**
Minor Vehicle Collision

**WEATHER/ENVIRONMENTAL CONDITIONS:**
Overcast skies, light rain, reduced visibility

**INDIVIDUALS INVOLVED:**
Driver 1: Alex Rosen, 42 years old, driving blue Honda Civic
Driver 2: Maria Santos, 29 years old, driving silver Nissan Altima

**INCIDENT NARRATIVE:**
Two-vehicle collision at controlled intersection. Driver 1 failed to yield right of way while making left turn. Driver 2 had green light proceeding straight. Minor damage to both vehicles, no injuries reported.

**OFFICER ACTIONS AND PROCEDURES:**
1. Secured accident scene with traffic cones
2. Checked for injuries - none reported
3. Interviewed both drivers separately
4. Took measurements and photos of scene
5. Completed accident report forms
6. Arranged for tow trucks for both vehicles

**EVIDENCE AND DOCUMENTATION:**
Digital photos of vehicle damage and scene
Measurements of skid marks and vehicle positions
Insurance information exchanged between parties
Accident report #AC-2024-156

**COMPLETE AUDIO TRANSCRIPT:**
[16:45:10] Officer: "Is anyone injured? Emergency services are on the way."
[16:45:20] Driver 1: "No, I think were both okay, just shaken up."
[16:45:35] Driver 2: "Im fine, but my car is damaged pretty bad."
[16:46:00] Officer: "Lets move to the sidewalk and Ill get your statements."`;

async function insertTestData() {
    console.log('🔄 Starting test data insertion...');
    
    try {
        // First, check if any users exist
        const checkUsersQuery = 'SELECT id, username FROM users LIMIT 5';
        
        db.all(checkUsersQuery, [], (err, users) => {
            if (err) {
                console.error('❌ Error checking users:', err);
                return;
            }
            
            console.log('👥 Found users:');
            users.forEach(user => {
                console.log(`   ID: ${user.id}, Username: ${user.username}`);
            });
            
            if (users.length === 0) {
                console.log('⚠️  No users found! Please register a user first through the web interface.');
                process.exit(1);
            }
            
            // Use the first user for test data
            const firstUser = users[0];
            console.log(`📝 Inserting test reports for user: ${firstUser.username} (ID: ${firstUser.id})`);
            
            let reportsInserted = 0;
            const totalReports = 3;
            
            // Insert test reports
            reportQueries.create(firstUser.id, testReport1, function(err) {
                if (err) {
                    console.error('❌ Error inserting report 1:', err);
                } else {
                    console.log('✅ Test report 1 inserted (Traffic Stop)');
                    reportsInserted++;
                    checkCompletion();
                }
            });
            
            reportQueries.create(firstUser.id, testReport2, function(err) {
                if (err) {
                    console.error('❌ Error inserting report 2:', err);
                } else {
                    console.log('✅ Test report 2 inserted (Theft Report)');
                    reportsInserted++;
                    checkCompletion();
                }
            });
            
            reportQueries.create(firstUser.id, testReport3, function(err) {
                if (err) {
                    console.error('❌ Error inserting report 3:', err);
                } else {
                    console.log('✅ Test report 3 inserted (Vehicle Accident)');
                    reportsInserted++;
                    checkCompletion();
                }
            });
            
            function checkCompletion() {
                if (reportsInserted === totalReports) {
                    console.log('');
                    console.log('🎉 All test reports inserted successfully!');
                    console.log('');
                    console.log('📋 To test:');
                    console.log('1. Start your server: npm run dev');
                    console.log('2. Login with your account');
                    console.log('3. Click "📋 All Report History" button');
                    console.log('');
                    
                    // Show the inserted reports
                    showInsertedReports(firstUser.id);
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

function showInsertedReports(userId) {
    reportQueries.findByUserId(userId, (err, reports) => {
        if (err) {
            console.error('❌ Error fetching reports:', err);
            return;
        }
        
        console.log(`📊 Found ${reports.length} reports in database:`);
        reports.forEach((report, index) => {
            const date = new Date(report.created_at).toLocaleString();
            const preview = report.report_content.substring(0, 100).replace(/\n/g, ' ') + '...';
            console.log(`   ${index + 1}. Report #${report.id} - ${date}`);
            console.log(`      Preview: ${preview}`);
        });
        
        console.log('');
        console.log('✅ Test data insertion complete!');
        process.exit(0);
    });
}

// Run the script
insertTestData();