import {Meteor} from 'meteor/meteor';
import '../imports/api/tasks.jsx';
import './accounts-config';

Meteor.startup(() => {
    // code to run on server at startup
    // Initialize accounts
    if (Meteor.users.find().count() === 0) {
        // Create Admin account
        const adminId = Accounts.createUser({
            username: 'admin',
            email: 'htuan@deloitte.com',
            password: '@nhTuan2211',
            firstName: 'Tuan',
            lastName: 'Hoang'
        });

        if (adminId) {
            Roles.addUsersToRoles(adminId, ['administrator', 'approver', 'user']);
        }

        // Create Fund account
        const fundId = Accounts.createUser({
            username: 'dcfund',
            email: 'tta@deloitte.com',
            password: 'DCF1234',
            firstName: 'Hung',
            lastName: 'Ta'
        });

        if (fundId) {
            Roles.addUsersToRoles(fundId, ['approver']);
        }
    }
});
