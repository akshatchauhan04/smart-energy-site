# WattWise — Smart Energy Consumption Monitoring and Optimization

WattWise is a beginner-friendly website for recording household energy use and understanding it at a glance. Add readings from your electricity meter or bill, explore the dashboard, and try a simulated live feed to see how a future meter connection could look.

> **Important:** The live monitor in this project is a browser simulation. It does not connect to a real electricity meter, sensor, or utility provider.

## Features

- **Energy dashboard:** View month-to-date energy, estimated cost, daily average, and highest-use day.
- **Manual readings:** Add a date, energy amount in kWh, and an optional note. Remove readings you no longer want.
- **Sample data:** Load sample readings to see how charts and summaries work.
- **Live demo:** Generate changing simulated power readings in watts, pause or resume the feed, and save its accumulated demo energy as a reading.
- **Usage chart:** Review daily totals for the last 7 or 30 days.
- **Daily target:** Set a goal in kWh and compare today's recorded usage with it.
- **Suggestions:** See simple energy-saving prompts based on the available readings.
- **Responsive layout:** Use the site on a desktop or phone.
- **No build step:** The site uses plain HTML, CSS, and JavaScript. It does not require Node.js, npm, a server, or a framework.

## Project files

```text
smart-energy-monitor/
├── index.html       # Page structure, dashboard, charts, and forms
├── style.css        # Colors, layout, responsive styles, and live-feed animation
├── app.js           # Reading storage, calculations, charts, suggestions, and demo feed
├── README.md        # This documentation
└── .nojekyll        # Enables GitHub Pages to serve the static project as-is
```

## Requirements

To run the project locally:

- A modern web browser such as Chrome, Edge, Firefox, or Safari.
- A text editor such as Visual Studio Code if you want to change the code.

To publish it online:

- A GitHub account.
- A **public** repository if you are using GitHub Free for Pages hosting.

There are no package dependencies to install.

## Run the project

### Option A: Open the page directly

1. Download or extract the project folder.
2. Open `index.html` in your browser.
3. Select **Load sample data** or **Add reading** to try the dashboard.

### Option B: Use Visual Studio Code

1. Open VS Code.
2. Select **File → Open Folder** and choose `smart-energy-monitor`.
3. Open `index.html` in a browser. If you have the Live Server extension installed, right-click `index.html` and select **Open with Live Server**.
4. Edit `app.js`, `style.css`, or `index.html`, save the file, and refresh the browser.

`app.js` is a browser script linked from `index.html`; it is not a Node.js server. Do not run `node app.js` for this project.

## How to use WattWise

1. Open the dashboard.
2. Select **Load sample data** to populate the charts with example values, or select **Add reading** to enter your own kWh usage.
3. Use **Last 7 days / Last 30 days** to change the chart range.
4. Select **Edit daily target** to change the daily goal.
5. Select **Start live demo** to see simulated watts change. Pause it whenever you like.
6. Select **Save session as reading** to save the demo's accumulated energy as a reading for today. The note will identify it as a simulated session.
7. Delete an individual row using its **×** button, or use **Clear all readings** to remove saved readings from this browser.

## Energy data and storage

This version does not use a hosted database. It stores readings and the daily target in the browser's built-in `localStorage`.

That means:

- Data stays in the browser on the device where it was entered, including after a refresh.
- Data does **not** sync to another device, browser, or user account.
- Clearing browser storage may erase the readings.
- Publishing the website to GitHub Pages publishes the application files, not your local readings.
- Do not enter private or sensitive information.

For shared accounts and cross-device synchronization, a future version would need a hosted database and authentication (for example, Supabase with row-level security). This project has no such connection configured.

## Live monitor: demo versus real meter

The demo feed creates random power values in the browser and updates every few seconds. Its energy counter is accelerated so the effect is visible during a short demo. It is useful for a school or portfolio demonstration, but it is not a real-time measurement and must not be treated as a bill or safety reading.

A real meter integration requires compatible hardware and an authorized data interface, such as a local gateway or provider API. The implementation depends on the meter brand, available protocol, network, and API access. Never put private API secrets in frontend JavaScript; a secure server-side component is usually needed to protect them.

## How calculations work

- **Monthly usage:** Sum of all readings whose date falls in the current calendar month.
- **Estimated monthly cost:** Monthly usage × the configured per-kWh rate.
- **Daily average:** Month-to-date usage ÷ the current day number in the month.
- **Peak day:** The date with the largest sum of readings; multiple entries on one day are added together.
- **Chart:** Sums entries per date across the selected date range. Days without readings show no usage bar.
- **Daily target:** Today's readings are added together and compared with the daily target.

These are simple educational estimates. Electricity bills may include taxes, fixed charges, tiered rates, time-of-use rates, and other adjustments.

## Customize the project

Open `app.js` and look near the top of the file:

```js
const TARIFF_RUPEES_PER_KWH = 8;
```

Change `8` to your approximate local price per kWh. The dashboard uses Indian rupees (₹) in this starter; update the currency labels in `index.html` and the cost formatting in `app.js` if you want a different currency.

The default daily target is set with the `TARGET_KEY` fallback value in `app.js`:

```js
let dailyTarget = Number(localStorage.getItem(TARGET_KEY)) || 10;
```

Change `10` to another starting target. Users can also adjust the target from the dashboard.

## Publish free with GitHub Pages

### Upload using the GitHub website

1. Sign in to GitHub and create a new repository named `smart-energy-monitor`.
2. Set the repository to **Public** if you are using GitHub Free.
3. In the repository, select **Add file → Upload files**.
4. Upload these project files directly to the repository's top level: `index.html`, `style.css`, `app.js`, `README.md`, and `.nojekyll`.
5. Commit the uploaded files to the `main` branch.
6. Open **Settings → Pages**.
7. Under **Build and deployment**, select **Deploy from a branch**.
8. Choose branch **`main`** and folder **`/(root)`**, then select **Save**.
9. Wait for GitHub Pages to finish. The Pages settings screen will show a **Visit site** link.

The site address usually follows this pattern:

```text
https://YOUR-GITHUB-USERNAME.github.io/smart-energy-monitor/
```

If your username is `akshatchauhan04`, the expected address is:

```text
https://akshatchauhan04.github.io/smart-energy-monitor/
```

The URL only works after the repository exists, the files are uploaded, and Pages has completed deployment. GitHub Pages publishes static files; this project does not need a server-side runtime.

### Optional Git commands from VS Code

If Git is installed and configured, open **Terminal → New Terminal** in VS Code, navigate to the project folder, then run the following. Replace `YOUR-USERNAME` with your GitHub username. First create an empty GitHub repository called `smart-energy-monitor` in the browser.

```bash
git init
git add .
git commit -m "Add WattWise energy dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/smart-energy-monitor.git
git push -u origin main
```

Then enable GitHub Pages using steps 6–9 above. If the GitHub website upload method is easier, you can skip these commands.

## Troubleshooting

- **The page is blank or unstyled:** Check that `index.html`, `style.css`, and `app.js` are all in the repository root with those exact filenames. Check the browser console for errors.
- **The Pages link returns 404:** Confirm Pages is set to `main` and `/(root)`, and confirm `index.html` is at the repository root. Wait for the deployment workflow to finish.
- **Changes do not appear:** Refresh the page, wait for Pages to deploy the latest commit, or try a hard refresh.
- **Readings disappeared:** They are stored in browser storage. Check that you are using the same device and browser and have not cleared site data.
- **The live demo does not match your meter:** That is expected; the feed is simulated and is not connected to any physical device.

## Learning goals

This project is a small example of:

- Semantic HTML and accessible forms.
- Responsive CSS layout.
- JavaScript event handling and DOM updates.
- Saving simple data with `localStorage`.
- Aggregating readings and calculating summaries.
- Deploying a static website with GitHub Pages.

## License

Choose a license before inviting others to reuse or contribute to the code. If you want others to freely use, modify, and share it, add an open-source license file such as an MIT License and include the appropriate copyright holder and year.
