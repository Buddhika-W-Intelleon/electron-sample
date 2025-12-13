
# Electron Testing Project

This is a small electron testing Project to learn how electron packaging works.

This project branch called image-save-impl focuses on image saving using filepath thus some backend systems may or may not have been implemented fully. (Intended to complete later)


## Run Locally

Clone the project

```bash
  git clone https://github.com/Buddhika-W-Intelleon/electron-sample/tree/file-path-save
```

Go to the project directory

```bash
  cd electron-sample
```

Install dependencies

```bash
  npm install
```

Go to the frontend directory

```bash
  cd electron-sample/frontend
```
Install dependencies there

```bash
  npm install
```
Go to the Backend directory

```bash
  cd electron-sample/e-backend
```
Install dependencies there

```bash
  npm install
```
### Then you will need to build each directory frontend, backend and the root.

Go to the root dir i.e: electron-sample

```bash
  npm run build:react
  npm run build:backend
  npm run build:electron
```
Finally to build the package run
```bash
  npm run package
```

The .exe file will be created at dist directory


## How it works

- This model focuses on saving image files which are uploaded to the app in the dedicated path.
- When first running the project you will be asked to create an account and choose image save path.
- The image save path can be selected from the popup window or the default image path will be used which is located on Appdata/Roaming/electron-sample/images
- The image save path then is saved on a settings.ini file which is automatically created on resources directory (Not implemented to change this though the app but can be changed by editing the ini file)
- Then when an image is uploaded from the upload page it will be saved on the designated directory.

## Backup
- A backup system is implemented which creates a zip file of the image save directory on a backups folder located on the resources directory.
- The backup system also uses rclone to sync the backup folder to a google drive folder named MyAppBackups
- You will need to have rclone installed and configured with google drive for this to work.
- You can change the rclone path on the server.ts file where indicated.

## How to install rclone and configure with google drive
- Download rclone from https://rclone.org/downloads/ or install using winget
```bash
  winget install rclone.rclone
```
- Open a command prompt and run the following command to configure rclone with google drive
```bash
  rclone config
```
- Follow the prompts to create a new remote and select google drive as the storage type.
- Once configured you can test the connection by running the following command
```bash
  rclone lsd gdrive:
```
- This should list the directories in your google drive.
- Now you can run the electron app and the backup system should work as intended.
## Note
- Make sure to keep your rclone installation updated for the best performance and compatibility.