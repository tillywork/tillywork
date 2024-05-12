module.exports = {
    apps: [
        {
            name: 'backend',
            script: './dist/backend/main.js',
            exec_mode: 'cluster',
            instances: 1, // Adjust the number of instances according to your needs
        }
    ],
};