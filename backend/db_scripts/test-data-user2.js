// test-data-user2.js - Script to insert test report data for the SECOND user
const { db, userQueries, reportQueries } = require('../utils/database');

const testReport1 = `**INCIDENT REPORT**

**REPORT TYPE:**
General Incident Report

**INCIDENT DATE:**
2024-06-25

**INCIDENT TIME:**
09:15

**LOCATION:**
789 Rothschild Boulevard, Tel Aviv, Israel

**REPORTING OFFICER:**
Officer Sarah Wilson

**BADGE NUMBER:**
Badge #2468

**INCIDENT CLASSIFICATION:**
Public Disturbance

**WEATHER/ENVIRONMENTAL CONDITIONS:**
Sunny morning, clear visibility, moderate temperature

**INDIVIDUALS INVOLVED:**
Subject: David Levy, 35 years old, wearing red jacket
Complainant: Store owner - Rachel Green, 45 years old

**INCIDENT NARRATIVE:**
Responded to complaint of individual causing disturbance outside retail store. Subject was arguing loudly with store employees about return policy. Situation de-escalated through verbal communication. No arrests made.

**OFFICER ACTIONS AND PROCEDURES:**
1. Responded to dispatch call for disturbance
2. Spoke with store owner to understand situation
3. Approached subject calmly and listened to concerns
4. Mediated discussion between parties
5. Provided information about consumer rights
6. Situation resolved peacefully

**EVIDENCE AND DOCUMENTATION:**
Body camera footage of entire interaction
No citations issued
Incident logged for record keeping

**COMPLETE AUDIO TRANSCRIPT:**
[09:15:20] Officer: "Good morning, I received a call about a disturbance. Can you tell me what's happening?"
[09:15:35] Subject: "They won't return my defective item and I paid good money for it!"
[09:15:50] Officer: "Let's discuss this calmly. What seems to be the issue with the return?"
[09:17:15] Store Owner: "We have a 30-day policy and this item was purchased 45 days ago."
[09:18:30] Officer: "Let me explain your options under consumer protection laws..."`;

const testReport2 = `**INCIDENT REPORT**

**REPORT TYPE:**
Crime Report

**INCIDENT DATE:**
2024-06-24

**INCIDENT TIME:**
19:45

**LOCATION:**
Central Bus Station, Tel Aviv, Israel

**REPORTING OFFICER:**
Officer Sarah Wilson

**BADGE NUMBER:**
Badge #2468

**INCIDENT CLASSIFICATION:**
Pickpocket Incident

**WEATHER/ENVIRONMENTAL CONDITIONS:**
Evening hours, artificial lighting, crowded area

**INDIVIDUALS INVOLVED:**
Victim: Tourist - Mark Johnson, 28 years old, from United States
Suspect: Unknown male, approximately 25 years old, fled scene

**INCIDENT NARRATIVE:**
Tourist reported wallet stolen while boarding bus at central station. Victim felt someone bump into him and discovered wallet missing moments later. Suspect had already disappeared into crowd. Wallet contained cash, credit cards, and identification.

**OFFICER ACTIONS AND PROCEDURES:**
1. Took detailed statement from victim
2. Reviewed available security camera footage
3. Canvassed area for witnesses
4. Assisted victim with canceling credit cards
5. Provided information about embassy services
6. Filed theft report for insurance purposes

**EVIDENCE AND DOCUMENTATION:**
Victim statement form completed
Security footage timestamps noted
Case #2024-PK-134 assigned
Tourist assistance forms provided

**COMPLETE AUDIO TRANSCRIPT:**
[19:45:10] Officer: "I understand your wallet was stolen. When did you first notice it was missing?"
[19:45:25] Victim: "Right after I got on the bus. Someone bumped into me really hard."
[19:45:40] Officer: "Can you describe the person who bumped into you?"
[19:46:00] Victim: "Young guy, dark hair, wearing a black hoodie. He disappeared really quickly."
[19:46:20] Officer: "Let's get your statement and help you contact your bank."`;

const testReport3 = `**INCIDENT REPORT**

**REPORT TYPE:**
Vehicle Accident Report

**INCIDENT DATE:**
2024-06-23

**INCIDENT TIME:**
13:20

**LOCATION:**
Allenby Street near Carmel Market, Tel Aviv

**REPORTING OFFICER:**
Officer Sarah Wilson

**BADGE NUMBER:**
Badge #2468

**INCIDENT CLASSIFICATION:**
Bicycle vs. Pedestrian Accident

**WEATHER/ENVIRONMENTAL CONDITIONS:**
Midday, bright sunlight, busy pedestrian area

**INDIVIDUALS INVOLVED:**
Cyclist: Yuki Tanaka, 22 years old, delivery driver
Pedestrian: Elderly woman - Ruth Cohen, 72 years old

**INCIDENT NARRATIVE:**
Bicycle delivery rider collided with elderly pedestrian who stepped into bike lane without looking. Minor injuries to pedestrian - scraped knee and bruised elbow. Cyclist uninjured but bicycle damaged. Ambulance called as precaution.

**OFFICER ACTIONS AND PROCEDURES:**
1. Secured accident scene in busy market area
2. Called for medical assistance
3. Interviewed both parties separately
4. Examined bicycle and documented damage
5. Took photographs of scene
6. Completed accident report forms

**EVIDENCE AND DOCUMENTATION:**
Photos of accident scene and bicycle damage
Medical report from paramedics
Witness statements from 2 market vendors
Accident report #AC-2024-167

**COMPLETE AUDIO TRANSCRIPT:**
[13:20:15] Officer: "Is everyone okay? Medical help is on the way."
[13:20:30] Pedestrian: "My knee hurts but I think I'm alright."
[13:20:45] Cyclist: "I'm sorry, she stepped right into the bike lane. I couldn't stop in time."
[13:21:00] Officer: "Let's wait for the paramedics to check you both out."
[13:21:20] Witness: "I saw the whole thing. The lady didn't look before crossing."`;

const testReport4 = `**INCIDENT REPORT**

**REPORT TYPE:**
Lost Property Report

**INCIDENT DATE:**
2024-06-21

**INCIDENT TIME:**
16:30

**LOCATION:**
Gordon Beach, Tel Aviv, Israel

**REPORTING OFFICER:**
Officer Sarah Wilson

**BADGE NUMBER:**
Badge #2468

**INCIDENT CLASSIFICATION:**
Lost Personal Property

**WEATHER/ENVIRONMENTAL CONDITIONS:**
Warm afternoon, crowded beach conditions

**INDIVIDUALS INVOLVED:**
Property Owner: Emma Rodriguez, 26 years old, tourist from Spain

**INCIDENT NARRATIVE:**
Tourist reported losing backpack containing passport, money, and personal items while swimming at Gordon Beach. Backpack was left unattended on beach for approximately 30 minutes. When returned, bag was missing.

**OFFICER ACTIONS AND PROCEDURES:**
1. Took detailed inventory of missing items
2. Searched immediate beach area
3. Checked with lifeguards and beach patrol
4. Contacted lost and found services
5. Provided embassy contact information
6. Filed lost property report

**EVIDENCE AND DOCUMENTATION:**
Lost property form completed
Beach patrol notification sent
Embassy assistance information provided
Case #2024-LP-078 assigned

**COMPLETE AUDIO TRANSCRIPT:**
[16:30:10] Officer: "You reported losing a backpack at the beach?"
[16:30:25] Tourist: "Yes, I left it here while swimming and now it's gone."
[16:30:40] Officer: "What was inside the backpack?"
[16:30:55] Tourist: "My passport, about 200 euros, my phone charger, and some clothes."
[16:31:15] Officer: "Let's file a report and contact the Spanish embassy for you."`;

async function insertTestDataForSecondUser() {
    console.log('🔄 Starting test data insertion for SECOND user...');
    
    try {
        // Check users and get the second one
        const checkUsersQuery = 'SELECT id, username FROM users ORDER BY id LIMIT 5';
        
        db.all(checkUsersQuery, [], (err, users) => {
            if (err) {
                console.error('❌ Error checking users:', err);
                return;
            }
            
            console.log('👥 Found users:');
            users.forEach(user => {
                console.log(`   ID: ${user.id}, Username: ${user.username}`);
            });
            
            if (users.length < 2) {
                console.log('⚠️  Less than 2 users found! Please register a second user first through the web interface.');
                console.log(`   Currently have ${users.length} user(s). Need at least 2 users.`);
                process.exit(1);
            }
            
            // Use the SECOND user for test data
            const secondUser = users[1];
            console.log(`📝 Inserting test reports for SECOND user: ${secondUser.username} (ID: ${secondUser.id})`);
            
            let reportsInserted = 0;
            const totalReports = 4;
            
            // Insert test reports for second user
            reportQueries.create(secondUser.id, testReport1, function(err) {
                if (err) {
                    console.error('❌ Error inserting report 1:', err);
                } else {
                    console.log('✅ Test report 1 inserted (Public Disturbance)');
                    reportsInserted++;
                    checkCompletion();
                }
            });
            
            reportQueries.create(secondUser.id, testReport2, function(err) {
                if (err) {
                    console.error('❌ Error inserting report 2:', err);
                } else {
                    console.log('✅ Test report 2 inserted (Pickpocket Incident)');
                    reportsInserted++;
                    checkCompletion();
                }
            });
            
            reportQueries.create(secondUser.id, testReport3, function(err) {
                if (err) {
                    console.error('❌ Error inserting report 3:', err);
                } else {
                    console.log('✅ Test report 3 inserted (Bicycle Accident)');
                    reportsInserted++;
                    checkCompletion();
                }
            });

            reportQueries.create(secondUser.id, testReport4, function(err) {
                if (err) {
                    console.error('❌ Error inserting report 4:', err);
                } else {
                    console.log('✅ Test report 4 inserted (Lost Property)');
                    reportsInserted++;
                    checkCompletion();
                }
            });
            
            function checkCompletion() {
                if (reportsInserted === totalReports) {
                    console.log('');
                    console.log('🎉 All test reports inserted successfully for second user!');
                    console.log('');
                    console.log('📋 To test:');
                    console.log('1. Start your server: npm run dev');
                    console.log(`2. Login as: ${secondUser.username}`);
                    console.log('3. Click "📋 All Report History" button');
                    console.log('');
                    
                    // Show the inserted reports
                    showInsertedReports(secondUser.id, secondUser.username);
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

function showInsertedReports(userId, username) {
    reportQueries.findByUserId(userId, (err, reports) => {
        if (err) {
            console.error('❌ Error fetching reports:', err);
            return;
        }
        
        console.log(`📊 Found ${reports.length} reports for user ${username}:`);
        reports.forEach((report, index) => {
            const date = new Date(report.created_at).toLocaleString();
            const preview = report.report_content.substring(0, 100).replace(/\n/g, ' ') + '...';
            console.log(`   ${index + 1}. Report #${report.id} - ${date}`);
            console.log(`      Preview: ${preview}`);
        });
        
        console.log('');
        console.log('✅ Test data insertion complete for second user!');
        console.log('');
        console.log('💡 Pro tip: Now you can test user separation by logging in as different users');
        console.log('   and verifying each user only sees their own reports!');
        process.exit(0);
    });
}

// Run the script
insertTestDataForSecondUser();