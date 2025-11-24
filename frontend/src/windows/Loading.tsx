const Loading = () => (
  <div style={{ textAlign: "center", marginTop: "40px" }}>
    <h2>Loading...</h2>
    <div style={{
      width: "50px",
      height: "50px",
      border: "5px solid #ccc",
      borderTop: "5px solid #333",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "20px auto"
    }} />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

export default Loading;
