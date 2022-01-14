module.exports = {
    apps: [
      {
        name: "peoply-frontend",
        script: "./node_modules/next/dist/bin/next",
        args: "start -p " + (process.env.PORT || 3001),
        watch: false,
        autorestart: true,
      },
    ],
  };
