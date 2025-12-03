
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

