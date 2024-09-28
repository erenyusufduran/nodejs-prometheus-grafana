const express = require('express');
const client = require('prom-client'); // Prometheus client

const app = express();
const port = 3001;

// Create a Registry which registers the metrics
const register = new client.Registry();

// Create a default metrics collection for HTTP requests and system metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2.5, 5, 15] // Custom bucket sizes for response time
});

// Register the histogram metric
register.registerMetric(httpRequestDurationMicroseconds);

app.use(express.json());

// Middleware to measure request duration
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : 'unknown', status_code: res.statusCode });
  });
  next();
});

// Handle login form submissions
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new Error('There is an error with username or password');
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 5 * 1000));
    return res.status(200).send({ username });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

// Handle logout
app.post('/logout', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2 * 1000));

  return res.status(200).send();
});

// Handle root
app.get('/', async (req, res) => {
  const rows = await new Promise((resolve, reject) => {
    resolve(['data1', 'data2']); // Sample data
  });
  return res.status(200).send(rows);
});

// Expose the metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
