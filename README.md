# PlasmoCount: automated detection and staging of malaria parasites from cytological smears

PlasmoCount is an ML tool for the automated detection and staging of malaria parasites in Giemsa-stained thin blood smears. PlasmoCount uses a collection of ResNets for the detection of individual red blood cells, classification of infection, and continuous staging of the asexual development of the parasite. You can access PlasmoCount's prototype on www.plasmocount.org (password for access available on request) or run it locally following the steps below.

### Requirements

PlasmoCount is built on a Flask framework with ReactJS for front-end development. You will need the following three packages installed: Python, Yarn, and Node.js. Make sure you install all Python and Node dependencies. You will also need to create an uploads folder and specify its path in the Flask config file.

### Contents

- `src/`: contains all the dynamic components in React.
- `api/`: contains the Flask project.
- `api/app.py`: contains all API endpoints.
- `api/models/`: stores all the ML models.

### Starting up the server

Start the production build of the React app, by running `yarn build`.
Then run the Flask server with `yarn start-api`.
Navigate to [port 5000](http://localhost:5000) to starting using PlasmoCount.

#### Development

If you would like to work on the user interface, you can start the React development server with `yarn start`. You can then navigate to [port 3000](http://localhost:3000) to track your file changes in the development environment.

For questions or more information, please contact [the Baum lab](https://baumlab.com).
