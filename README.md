# DCFund UI
UI for DCFund blockchain

* clone this repo
* `cd` into the app's directory 
* run `meteor npm install` then `meteor`
* open `http://localhost:3000` in your browser

Commands for heroku cli
* `heroku config:set ROOT_URL="https://<appname>.herokuapp.com"`
* `heroku config:set METEOR_SETTINGS="$(cat settings.json)" --app <appname>`

To-do lists
* Balance for DCFund - **Done**
* Balance for report
* Check fund balance when user raise borrow request
* Check borrowing amount when user raise pay request
* Check fund balance when approve borrow request
* Withdraw feature