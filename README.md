# PlasmoCount: automated detection and staging of malaria parasites from cytological smears

PlasmoCount is an ML tool for the automated detection and staging of malaria parasites in Giemsa-stained thin blood smears. PlasmoCount uses a collection of ResNets for the detection of individual red blood cells, classification of infection, and continuous staging of the asexual development of the parasite. You can access PlasmoCount's prototype on https://plasmocount.org or run it locally following the steps below.

The username and password for PlasmoCount are available at https://www.baumlab.com/plasmocount.
Please note, PlasmoCount currently only accepts *Plasmodium falciparum* blood smears. 
### Requirements

PlasmoCount is built on a Flask framework with ReactJS for front-end development. You will need the following three packages installed: Python, Yarn, and Node.js. Before you start, make sure you install all Python and Node dependencies (see below). You will also need to create an uploads folder and specify its path in the Flask config file. Finally, download the models using `git lfs pull`.

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

Please note that in this local version, all form inputs except for the uploaded files are disabled.

For questions or more information, please contact [the Baum lab](https://baumlab.com).


### Installing dependencies 
Download python at : https://www.python.org/downloads/  
Ensure you can run Python: type `python --version`in the command line.

Download and install Yarn and Node.js through the npm package manager.
Download both at https://nodejs.org/en/

To confirm you have Node.js and npm installed run `node -v` and `npm -v` in the command line. 

Install Yarn by running `npm install -global yarn` in the command line. 
To confirm you have Yarn installed, run `yarn --version` in the command line. 

The recommended way to install Python library dependencies is with the pip command. 
To confirm you have pip installed, run `pip --version` in the comand line.
If pip is not installed, visit:  https://packaging.python.org/tutorials/installing-packages/#ensure-you-can-run-pip-from-the-command-line and go to section: Ensure you can run pip from the command line. 

requirements.txt contains all Python dependencies required. 

To install all Python dependencies using pip run `pip install -r api/requirements.txt` on the command line. 

To install all Node.js dependencies run `npm install` on the command line. This will install all Node.js dependencies in the package.json file. 

To install all Yarn dependencies run `yarn install`. This will install all Yarn dependencies in the package.json file. 
