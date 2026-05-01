import React, { useState, useRef, useEffect } from "react";
import "./ChatbotShroddha.css";

const getBotReply = async (userMsg, history) => {
  // ✅ Changed from port 3001 to 8081
  const response = await fetch("http://localhost:8081/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMsg,
      history: history.filter(m => m.text && m.text !== "...")
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  const data = await response.json();
  return data.reply;
};

function ChatbotShroddha() {
  const chatBodyRef = useRef(null);

  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ location: "", name: "", phone: "" });

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I am JeevanDhara 💗 How can I help you today?",
      options: ["🚑 Book Ambulance", "🏥 Find Hospital", "🆘 Safety Help"]
    }
  ]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (userText, currentMessages) => {
    try {
      const reply = await getBotReply(userText, currentMessages);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: "bot", text: reply }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { from: "bot", text: "Sorry, something went wrong. Please try again." }
      ]);
      console.error("Chat error:", error.message);
    }
  };

  const handleOption = (optText) => {

    if (mode === "safety") {
      if (optText.includes("112")) {
        window.location.href = "tel:112";
        return;
      }
      if (optText.includes("Emergency Contact")) {
        setMode("safety");
        setStep(1);
        setMessages(prev => [
          ...prev,
          { from: "user", text: optText },
          { from: "bot", text: "👤 Enter your emergency contact number." }
        ]);
        return;
      }
      if (optText.includes("Location")) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
              setMessages(prev => [
                ...prev,
                { from: "user", text: optText },
                { from: "bot", text: `📍 Your location: ${coords}` }
              ]);
            },
            () => {
              setMessages(prev => [
                ...prev,
                { from: "user", text: optText },
                { from: "bot", text: "❌ Could not get location. Please enable location access." }
              ]);
            }
          );
        } else {
          setMessages(prev => [
            ...prev,
            { from: "user", text: optText },
            { from: "bot", text: "❌ Geolocation is not supported by your browser." }
          ]);
        }
        return;
      }
    }

    if (optText.includes("Ambulance")) {
      setMode("ambulance");
      setStep(1);
      setMessages(prev => [
        ...prev,
        { from: "user", text: optText },
        { from: "bot", text: "🚑 Please share your location (area/address)." }
      ]);
      return;
    }

    if (optText.includes("Hospital")) {
      setMode("hospital");
      setStep(1);
      setMessages(prev => [
        ...prev,
        { from: "user", text: optText },
        { from: "bot", text: "🏥 Please tell me your city." }
      ]);
      return;
    }

    if (optText.includes("Safety")) {
      setMode("safety");
      setStep(0);
      setMessages(prev => [
        ...prev,
        { from: "user", text: optText },
        {
          from: "bot",
          text: "🆘 You are not alone. Call 112 immediately if you are in danger.",
          options: ["📞 Call 112", "👤 Add Emergency Contact", "📍 Share My Location"]
        }
      ]);
      return;
    }

    if (optText.includes("Directions")) {
      setMessages(prev => [
        ...prev,
        { from: "user", text: optText },
        { from: "bot", text: "📍 Please search for the hospital on Google Maps for directions." }
      ]);
      return;
    }

    if (optText.includes("Search Again")) {
      setMode("hospital");
      setStep(1);
      setMessages(prev => [
        ...prev,
        { from: "user", text: optText },
        { from: "bot", text: "🏥 Please tell me your city." }
      ]);
      return;
    }

    const updated = [
      ...messages,
      { from: "user", text: optText },
      { from: "bot", text: "..." }
    ];
    setMessages(updated);
    sendMessage(optText, updated);
  };

  const handleSend = async () => {
    if (inputText.trim() === "") return;
    const userMsg = inputText.trim();
    setInputText("");

    if (mode === "ambulance") {
      if (step === 1) {
        setFormData(prev => ({ ...prev, location: userMsg }));
        setMessages(prev => [
          ...prev,
          { from: "user", text: userMsg },
          { from: "bot", text: "👤 Please enter the patient name." }
        ]);
        setStep(2);
        return;
      }
      if (step === 2) {
        setFormData(prev => ({ ...prev, name: userMsg }));
        setMessages(prev => [
          ...prev,
          { from: "user", text: userMsg },
          { from: "bot", text: "📞 Please enter a contact number." }
        ]);
        setStep(3);
        return;
      }
      if (step === 3) {
        const finalData = { ...formData, phone: userMsg };
        setMessages(prev => [
          ...prev,
          { from: "user", text: userMsg },
          {
            from: "bot",
            text: `🚑 Ambulance booked!\n📍 Location: ${finalData.location}\n👤 Name: ${finalData.name}\n📞 Phone: ${finalData.phone}\n⏱ ETA: 10 minutes`
          }
        ]);
        setMode(null);
        setStep(0);
        setFormData({ location: "", name: "", phone: "" });
        return;
      }
    }

    if (mode === "hospital" && step === 1) {
      setMessages(prev => [
        ...prev,
        { from: "user", text: userMsg },
        {
          from: "bot",
          text: `🏥 Hospitals in ${userMsg}:\n- Apollo Hospital\n- Fortis Hospital\n- AMRI Hospital\nWould you like directions?`,
          options: ["📍 Get Directions", "🔄 Search Again"]
        }
      ]);
      setMode(null);
      setStep(0);
      return;
    }

    if (mode === "safety" && step === 1) {
      setMessages(prev => [
        ...prev,
        { from: "user", text: userMsg },
        {
          from: "bot",
          text: `✅ Emergency contact ${userMsg} saved! They will be notified in an emergency.`
        }
      ]);
      setMode("safety");
      setStep(0);
      return;
    }

    const updated = [
      ...messages,
      { from: "user", text: userMsg },
      { from: "bot", text: "..." }
    ];
    setMessages(updated);
    await sendMessage(userMsg, updated);
  };

  return (
    <div className="container">
      {isOpen ? (
        <div className="chat-container open">

          <div className="chat-header">
            <h3>JeevanDhara Chatbot</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.from}`}>
                <p className={`msg-bubble ${msg.text === "..." ? "typing" : ""}`}>
                  {msg.text}
                </p>
                {msg.options && (
                  <div className="options">
                    {msg.options.map((opt, i) => (
                      <button key={i} onClick={() => handleOption(opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>➤</button>
          </div>

        </div>
      ) : (
        <button className="chat-btn" onClick={() => setIsOpen(true)}>
          Jeevan Dhara <br /> Chatbot
        </button>
      )}
    </div>
  );
}

export default ChatbotShroddha;