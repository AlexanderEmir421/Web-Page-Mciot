document.addEventListener('DOMContentLoaded', function() {
    const manualBtn = document.getElementById('manualBtn');
    const qrBtn = document.getElementById('qrBtn');
    const manualInstructions = document.getElementById('manualInstructions');
    const qrScanner = document.getElementById('qrScanner');
    const connectBtn = document.getElementById('connectBtn');
    const qrVideo = document.getElementById('qrVideo');

    let stream = null;

    function setActiveButton(button) {
        [manualBtn, qrBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    function stopQRScanner() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        qrVideo.srcObject = null;
    }

    manualBtn.addEventListener('click', function() {
        setActiveButton(this);
        stopQRScanner();
        manualInstructions.classList.remove('hidden');
        qrScanner.classList.add('hidden');
        connectBtn.classList.remove('hidden');
    });

    qrBtn.addEventListener('click', function() {
        setActiveButton(this);
        manualInstructions.classList.add('hidden');
        qrScanner.classList.remove('hidden');
        connectBtn.classList.remove('hidden');
        startQRScanner();
    });

    connectBtn.addEventListener('click', function() {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            window.location.href = `http://192.168.4.1?userId=${encodeURIComponent(accessToken)}`;
        } else {
            alert('No se encontró el token de acceso.');
        }
    });

    function startQRScanner() {
        if (stream) {
            return; // QR scanner is already running
        }

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(videoStream) {
                stream = videoStream;
                qrVideo.srcObject = stream;
                qrVideo.play();
                requestAnimationFrame(tick);
            })
            .catch(function(error) {
                console.error("Error al acceder a la cámara", error);
                alert("No se pudo acceder a la cámara. Por favor, asegúrese de que tiene permisos de cámara habilitados.");
            });
    }

    function tick() {
        if (qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement("canvas");
            canvas.height = qrVideo.videoHeight;
            canvas.width = qrVideo.videoWidth;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(qrVideo, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                console.log("QR Code detectado", code.data);
                localStorage.setItem('userId', code.data);
                alert("QR Code detectado: " + code.data);
                stopQRScanner();
                connectBtn.click();
            } else if (stream) {
                requestAnimationFrame(tick);
            }
        } else if (stream) {
            requestAnimationFrame(tick);
        }
    }

    lucide.createIcons();
});