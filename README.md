# Document Management System

## Introduction

This project implements a sophisticated document management solution designed to enhance personal document organization and retrieval. Key features include:

- **Hashing Algorithm**: Assigns a unique, compact identifier to each document, ensuring rapid lookup and preventing duplicates.
- **Predictive Search**: Powered by a trie data structure, suggesting potential document titles as the user types.
- **Tagging and Filtering**: Facilitates logical organization and efficient file discovery.

## Tech Stack

- **Backend**: Python
- **Frontend**: JavaScript, HTML, CSS, ReactJS
- **Framework**: NodeJS
- **UI Components**: DevExtreme
- **Database**: TinyDB, DynamoDB (AWS)
- **Cloud File Storage**: S3 (AWS)

## Local Deployment Guide

### Prerequisites

Ensure you have the following installed on your local machine:

- Python (version 3.12.2 or later)
- NodeJS (version 20.11.1 or later)
- Git (version 2.45.1 or later)

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/eca-kubi/docu-management-system.git
   cd docu-management-system
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm ci
   ```

   Create a `.env` file in the `frontend` directory with the following content:

   ```
   REACT_APP_API_URL=http://localhost:5000
   PORT=3000
   ```

   Build and run the frontend:

   ```bash
   npm run build
   npx serve -s build
   ```

3. **Backend Setup**

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

   Create a `.env` file in the `backend` directory with the following content:

   ```
   PORT=5000
   ```

   Run the backend service:

   ```bash
   python app.py
   ```

## Verifying the Installation

Access the following URLs from your web browser:

- Backend service: http://localhost:5000
- Frontend GUI: http://localhost:3000

## Demo Account

Use the following credentials to log in:

- Email: eric.clinton-appiahkubi@iubh.de
- Password: [Any value]

## Contributing

We welcome contributions to improve the Document Management System. Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Testing the AWS Serverless Deployment

A lambda serverless deployment of the Document Management System is available on AWS. To access the deployment, visit the following URL:
[http://docu-management-system-254576844324.s3-website-us-east-1.amazonaws.com/](http://docu-management-system-254576844324.s3-website-us-east-1.amazonaws.com/)

Use the same demo account credentials above to log in.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

## Acknowledgements

- [Python](https://www.python.org/)
- [NodeJS](https://nodejs.org/)
- [ReactJS](https://reactjs.org/)
- [DevExtreme](https://js.devexpress.com/)
- [TinyDB](https://tinydb.readthedocs.io/)
- [AWS](https://aws.amazon.com/)
