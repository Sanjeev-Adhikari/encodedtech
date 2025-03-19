const Services = () => {
    
        const services = [
          {
            title: "Cloud Solutions",
            description: "Scalable and secure cloud infrastructure tailored to your business needs.",
            icon: "☁️", // Replace with an actual icon or image
          },
          {
            title: "AI & Machine Learning",
            description: "Harness the power of AI to drive innovation and efficiency.",
            icon: "🤖", // Replace with an actual icon or image
          },
          {
            title: "Cybersecurity",
            description: "Protect your digital assets with our advanced security solutions.",
            icon: "🔒", // Replace with an actual icon or image
          },
          {
            title: "Data Analytics",
            description: "Turn your data into actionable insights with our analytics tools.",
            icon: "📊", // Replace with an actual icon or image
          },
          {
            title: "Software Development",
            description: "Custom software solutions to meet your unique business requirements.",
            icon: "💻", // Replace with an actual icon or image
          },
          {
            title: "IT Consulting",
            description: "Expert advice to optimize your IT strategy and operations.",
            icon: "📈", // Replace with an actual icon or image
          },
        ];
      
        return (
          <div style={{
            padding: "4rem 2rem",
            background: "linear-gradient(to bottom, #001030, #000510)",
            color: "white",
            textAlign: "center",
          }}>
            <h2 style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              marginBottom: "2rem",
              background: "linear-gradient(45deg, #39ff14, #00ffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Our Services
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              maxWidth: "1200px",
              margin: "0 auto",
            }}>
              {services.map((service, index) => (
                <div key={index} style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "10px",
                  padding: "2rem",
                  boxShadow: "0 0 20px rgba(0, 102, 255, 0.3)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                 
                }}>
                  <div style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                  }}>
                    {service.icon}
                  </div>
                  <h3 style={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    fontSize: "1rem",
                    color: "rgba(255, 255, 255, 0.8)",
                  }}>
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      };
   

 
export default Services;