export default function DebugPage() {
  return (
    <html>
      <head>
        <title>Debug Page</title>
      </head>
      <body>
        <h1>Debug Page</h1>
        <p>Server is working!</p>
        <p>Time: {new Date().toISOString()}</p>
      </body>
    </html>
  );
}
