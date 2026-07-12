# atlas-digital-automation
Atlas Digital Automation is a modern AI-powered digital agency specializing in custom websites, landing pages, AI chatbots, AI agents, workflow automation, business process automation, and software development. Built with modern web technologies to deliver scalable, secure, and high-performance digital solutions.

## n8n Workflow Library

The GitHub Pages site includes a static n8n workflow viewer at:

```text
https://atlasdigitalautomation.com/n8n-workflows/
```

GitHub Pages can publish exported workflow JSON files, but it cannot run the live n8n editor or execute workflows. For live n8n access from anywhere, use a secure tunnel such as Cloudflare Tunnel or Tailscale.

To sync exports from the Raspberry Pi that runs n8n:

```bash
cd /path/to/atlas-digital-automation
chmod +x n8n-workflows/scripts/export-n8n-workflows.sh
./n8n-workflows/scripts/export-n8n-workflows.sh
```

The script exports workflows into `n8n-workflows/workflows`, rebuilds the manifest, commits the workflow changes, and pushes them to GitHub.

For an automated sync every 30 minutes, add this on the Pi with `crontab -e`:

```cron
*/30 * * * * cd /path/to/atlas-digital-automation && ./n8n-workflows/scripts/export-n8n-workflows.sh >> n8n-workflows/export.log 2>&1
```

Review exported JSON before publishing. n8n usually does not export credential secret values, but workflow files can still reveal webhook paths, service names, field mappings, and business logic.
