module.exports = {
  apps: [
    {
      name: "rentivo-fe",
      script: "npx",
      args: "react-router-serve ./build/server/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
