## Target an Environment
Let's say `DEV`.

## Prepare a Build Repository on Portal
Open an existing Build Repository or set-up a new one, remember the `build_repo_id` and `upload_password`.

## Prepare a Game Product on Portal
On portal, choose an existing game product or create a new one(optionally with additional Add-ons). Remember the id of the game (and optionally the Add-ons). Go and configure the game:
1. go to `Settings`, make sure the `Platform` is selected as `PC`, select the Build Repository to the one referenced above. Check `IsFree`.
2. go to `Branches`, click the `live` branch, go to `Install` tab, enter a value in `Folder` field.

## Prepare a Game Build
Normally, the game production team will create a game build, here we use the game generator script located in `{path-to-your-git-repo}\platform\tools\scripts\manual_scripts\generation_game_repository_and_manifest`:
1. Duplicate `config.yml` and name it to `custom_config.yml`.
2. Open `custom_config.yml`, make sure the following entries are changed:
   1. `build - game_id`: Id of the game, should match the one of the game product stored in portal.
   2. `build - dlc`: array of ids of the dlcs connected to the game, should match the ones of the dlc products stored in portal.
   3. `upload_commands - env - dev - build_repo_id`: build repo id pre-filled for the upload commands, should match the id of the build repository id stored in portal.
   4. `upload_commands - env - dev - build_repo_pw`: build repo password pre-filled for the upload commands, should match the password of the build repository id stored in portal.
3. Open a cmd, and run `python generate_repo_manifest.py buildgen custom_config.yml`. Reference `readme.txt` in the same directory.
4. After the script is done, a dummy generated game build along with a pre-filled upload commands file will be placed at `{path-to-your-git-repo}\platform\tools\build\working_directory\`
5. Remember the executable path name. Default is `ValidationGame.exe`

## Upload Game Builds
Run the generated upload commands to upload some game builds. Open portal again, go to `<game_product> - Branches - live`:
1. Open `Settings` tab, select a desired build in `Active build`. 
2. Open `Install` tab, scroll down to `Executables`, click `Add executable`, enter a value for `Name` and `Path` fields, check `SDK Enabled`.
3. Click `Save`.

## Schedule a Package
On portal, create a new product of type `Package`:
1. Switch to `Contents` tab, include the game product and the dlcs, click `Save`.
2. Switch to `States` tab, you will see the preset schedule for the package. Click `Schedule a state`, set `Visible`, `Downloadable` or `Playable` as you wish.

## Download and Run the Game from Dev Uplay Client
Start the Uplay PC client under `DEV` environment, Reference [here](https://mdc-web-tomcat17.ubisoft.org/confluence/pages/viewpage.action?pageId=349130177) to see the args. Register an account for `DEV` environment. Go to portal under `Users` tab, give ownership of the game product to your `DEV` account. You should now see the game in the client dashboard. Go download and run the game after all configuration is finished.

