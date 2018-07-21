import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import '../imports/api/blockchain.jsx';
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

    // Accounts setting
    Accounts.emailTemplates.from = "noreply@dcfund.app";
    Accounts.emailTemplates.resetPassword = {
        subject(user) {
            return "[DCFund] Reset password";
        },
        text(user, url) {
            return `Hello,
            
You or someone has request password reset for your DCFund Wallet.

If you need password reset, please click the link ${url}

If you didn't request this email, please ignore it.

Thank you.`
        },
        html(user, url) {}
    };
    Accounts.urls.resetPassword = function (token) {
        return Meteor.absoluteUrl('reset-password/' + token);
    };
});
