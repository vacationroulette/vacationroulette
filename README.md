# VacationRoulette
Catch a plane without the pain!

## About
VacationRoulette is a service that allows for one to find a vacation quickly without much planning. We decided to use the Sabre API to plan a spur of the moment, round-trip, vacation. With the information gathered from [Sabre](https://developer.sabre.com/page), we created dynamic [Kayak](http://www.kayak.com/) URLs to book the trip using the provider of your choice, for the lowest cost. VacationRoulette requires only a leaving/returning date and an Airport code, and provides minimal filters such as: general price point, desired theme, and relative location. Once a suggestion has been made, you may book a trip using that information, or continue looking for new trips.

This is an opensource project under the MIT license, and utilizes an Expressjs environment on top Nodejs:
 - [Express](http://expressjs.com/)
 - [node.js](http://nodejs.org/)

along with:
 - [Pure CSS](http://purecss.io/)
 - [jQuery](http://jquery.com/)
 - [lodash.js](https://lodash.com/)
 - [heroku](https://www.heroku.com/)

## Building
### Prerequisites
 - [node.js](http://nodejs.org/)

### Build process
 1. Clone: `git clone git@github.com:vacationroulette/vacationroulette.git`
 2. Build: `cd vacationroulette; npm install; bower install`
 3. Configure: Create a file named `config.json` in the following format:

```json
{
  "client_id": "<Sabre API Client ID>",
  "client_secret": "<Sabre API Client Secret>",
  "uri": "https://api.test.sabre.com"
}
```
 4. Run: `node bin/www`
 5. Enjoy: Visit `localhost:3000` in your web browser of choice

## Disclaimer
The entirety of this project was built in under 24 hours with the primary goal of being demoable. This is a **prototype** and in no way shape or form is it suitable to be used in a production environment. This uses a free developer key from [Sabre](https://developer.sabre.com/docs/read/Home) to get flight information.

## Credits
VacationRoulette was created in a 24 hour hackathon, [HackDFW](http://hackdfw.com/), by:
 - [Rahat Ahmed](https://github.com/rahatarmanahmed)
 - [Jonathan Darling](https://github.com/jmdarling)
 - [Zack Urben](https://github.com/zackurben)
