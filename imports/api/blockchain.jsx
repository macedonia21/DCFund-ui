import {Meteor} from 'meteor/meteor';
import {HTTP} from 'meteor/http';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
}

Meteor.methods({
    'blocks.get'() {
        // Make sure the user is logged in before inserting a task
        if (!Meteor.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // fetch(Meteor.settings.public.apiURL + '/blocks')
        //     .then((result) => {
        //         return result.json();
        //     }).then((data) => {
        //     if (data.length > 0) {
        //         data.sort((blockA, blockB) => {
        //             return blockB.timestamp - blockA.timestamp;
        //         });
        //         return data;
        //     } else {
        //         return null;
        //     }
        // });

        try {
            const result = HTTP.get(Meteor.settings.public.apiURL + '/blocks');
            if (result) {
                return result.data.map((block) => {
                    return {
                        "index": block.index,
                        "hash": block.hash
                    }
                });
            } else {
                return [];
            }
        } catch (e) {
            throw new Meteor.Error(e.message);
        }
    },
});
