
let audio = new Audio();
let isPlaying = false;
let currentVolume = 0.8;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout = null;

const streamUrl = "https://giss.tv:667/frecuenciamanabi.mp3";
const playButton = document.getElementById('playButton');
const playIcon = document.getElementById('playIcon');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const statusText = document.getElementById('statusText');
const liveStatus = document.getElementById('liveStatus');

audio.src = streamUrl;
audio.volume = currentVolume;
volumeSlider.value = currentVolume;

// ---------------------------------------------------
// FUNCION PARA ACTUALIZAR TRANSMISION DE AUDIO

function updateLiveStatus() {
    if (isPlaying) {
        liveStatus.innerHTML = `
            <div class="status-live">
                <i class="fas fa-circle fa-xs"></i> 
                EN VIVO
                <i class="fas fa-circle fa-xs"></i> 
            </div>`;
    } else {
        liveStatus.innerHTML = `
            <div class="press-to-play">
                Presiona Play para escuchar
            </div>`;
    }
}

function updateStatus(message, color = "") {
    statusText.textContent = message;
    statusText.className = `status-text ${color}`;
}


// ---------------------------------------------------
// ANIMACION DE VOLUMEN 

function animateVolumeSlider() {
    volumeSlider.classList.add('animate');
    setTimeout(() => volumeSlider.classList.remove('animate'), 400);
}

// ---------------------------------------------------
// ANIMACION DEL PLAY

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playIcon.classList.replace('fa-pause', 'fa-play');
        // Ya no muestra "En pausa"
    } else {
        playAudio();
    }
    isPlaying = !isPlaying;
    updateLiveStatus();
}

function playAudio() {
    // TRUCO PARA PWA: Forzamos al reproductor a cargar el flujo de audio 100% en vivo antes de sonar
    audio.src = streamUrl;
    
    audio.play().then(() => {
        playIcon.classList.replace('fa-play', 'fa-pause');
        reconnectAttempts = 0;
        updateStatus("", "");
    }).catch(() => {
        updateStatus("Error de conexión. Reconectando...", "text-danger");
    });
}


// ---------------------------------------------------
// FUNCION DE VOLUMEN 

function updateSliderColor() {
    const percent = volumeSlider.value * 100;

    volumeSlider.style.background =
        `linear-gradient(
            to right,
            var(--primary-color) 0%,
            var(--primary-color) ${percent}%,
            #444 ${percent}%,
            #444 100%
        )`;
}

// FUNCION DE MAXIMO VOLUMEN

function setMaxVolume() {
    currentVolume = 1;
    animarVolumen(1);
    animateVolumeSlider();
}

// FUNCION DE MUTE VOLUMEN

function setMute() {

    currentVolume = 0;
    animarVolumen(0);
    animateVolumeSlider();
}

volumeSlider.addEventListener('input', () => {
    currentVolume = parseFloat(volumeSlider.value);
    audio.volume = currentVolume;
    volumeValue.textContent = Math.round(currentVolume * 100) + "%";
    updateSliderColor();
});

// ------------------------------------------------------
// FUNCION PARA EL RANGO DE VOLUMEN ANIMADO

function animarVolumen(destino) {

    const inicio = parseFloat(volumeSlider.value);

    const duracion = 300; // ms
    const fps = 60;

    const pasos = duracion / (1000 / fps);

    let pasoActual = 0;

    const incremento = (destino - inicio) / pasos;

    const animacion = setInterval(() => {

        pasoActual++;

        const nuevoValor = inicio + (incremento * pasoActual);

        volumeSlider.value = nuevoValor;
        audio.volume = nuevoValor;

        volumeValue.textContent =
            Math.round(nuevoValor * 100) + "%";

        updateSliderColor();


        function animarVolumen(destino) {

            const inicio = parseFloat(volumeSlider.value);

            let valorActual = inicio;

            const velocidad = 0.02;

            const intervalo = setInterval(() => {

                if (destino > inicio) {

                    valorActual += velocidad;

                    if (valorActual >= destino) {
                        valorActual = destino;
                        clearInterval(intervalo);
                    }

                } else {

                    valorActual -= velocidad;

                    if (valorActual <= destino) {
                        valorActual = destino;
                        clearInterval(intervalo);
                    }
                }

                volumeSlider.value = valorActual;
                audio.volume = valorActual;

                volumeValue.textContent =
                    Math.round(valorActual * 100) + "%";

                updateSliderColor();

            }, 10);
        }

    
        if (pasoActual >= pasos) {

            volumeSlider.value = destino;
            audio.volume = destino;

            volumeValue.textContent =
                Math.round(destino * 100) + "%";

            clearInterval(animacion);
        }

    }, 1000 / fps);
}



// -----------------------------------------------
// Reconexión automática

function attemptReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
        updateStatus("No se pudo conectar. Pulsa Play", "text-danger");
        return;
    }
    reconnectAttempts++;
    updateStatus(`Reconectando... (${reconnectAttempts}/${maxReconnectAttempts})`, "text-warning");

    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(() => {
        audio.load();
        playAudio();
    }, 2800);
}

audio.addEventListener('error', () => {
    if (isPlaying) attemptReconnect();
});

audio.addEventListener('playing', () => {
    updateStatus("", "");
});

// -----------------------------------------------
// Metadata simulada
setInterval(() => {
    if (isPlaying) {
        songTitle.textContent = "Música en Vivo";
    }
}, 9000);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    }
});


// -----------------------------------------------
// funcion para mostrar y ocultar 
// MOSTRAR NOTICIAS

async function mostrarNoticias() {

    document.getElementById("radio").style.display = "none";
    const response = await fetch("noticias.html");
    const html = await response.text();
    document.getElementById("contenido").innerHTML = html;
    cargarNoticias();
    activarMenu("btnNoticias");
}
// MOSTRAR INICIO

function mostrarInicio() {

    document.getElementById("radio").style.display = "block";
    document.getElementById("contenido").innerHTML = "";
    activarMenu("btnInicio");
}

// -----------------------------------------------
// FUNCION PARA EFECTO DEL MENU

function activarMenu(menu) {

    const botones = [
        "btnInicio",
        "btnNoticias",
        "btnAjustes",
        "btnInicioDesktop",
        "btnNoticiasDesktop",
        "btnAjustesDesktop"
    ];

    botones.forEach(id => {

        const btn = document.getElementById(id);

        if(btn){
            btn.classList.remove("active", "text-warning");
        }
    });

    const activo = document.getElementById(menu);
    if(activo){
        activo.classList.add("active", "text-warning");
    }

    const activoDesktop =
        document.getElementById(menu + "Desktop");

    if(activoDesktop){
        activoDesktop.classList.add("active", "text-warning");
    }
}



// -----------------------------------------------------------
// -----------------------------------------------------------
// MOSTRAR NOTICIAS DE DIVERSAS PAGINAS Y CLASIFICAR POR CATEGORIA


const URL_WORKER = "https://still-mountain-27bb.2143emilio.workers.dev";

// Diccionario para asignarle un icono de FontAwesome a cada categoría automáticamente
const iconosCategorias = {
    "Tecnología": "fas fa-laptop-code",
    "Noticias generales Ecuador": "fas fa-flag",
    "Noticias Internacionales": "fas fa-globe",
    "Economía Internacional": "fas fa-chart-line",
    "Mundo Motor": "fas fa-car",
    "Deportes": "fas fa-running",
    "Entretenimiento": "fas fa-film",
    "default": "fas fa-newspaper" // Icono por si aparece una categoría nueva
};

async function cargarNoticias() {
    try {
        const respuesta = await fetch(URL_WORKER);
        const noticias = await respuesta.json();
        
        const zonaNoticias = document.getElementById("zonaNoticias");


        // --- EL ESCUDO DE PROTECCIÓN ---
        if (!zonaNoticias) {
            // Si no encuentra el div en pantalla, sale de la función sin romper nada
            return; 
        }
        // -------------------------------

        // Limpiamos el mensaje de "Cargando..."
        zonaNoticias.innerHTML = "";

        // Limpiamos el mensaje de "Cargando..."
        //zonaNoticias.innerHTML = ""; 

        // 1. Agrupar las noticias por categoría utilizando un Objeto
        const noticiasAgrupadas = {};
        
        noticias.forEach(noticia => {
            if (!noticiasAgrupadas[noticia.categoria]) {
                noticiasAgrupadas[noticia.categoria] = [];
            }
            noticiasAgrupadas[noticia.categoria].push(noticia);
        });

        // 2. Recorrer cada categoría y construir su HTML
        for (const categoria in noticiasAgrupadas) {
            
            // Elegir icono
            const icono = iconosCategorias[categoria] || iconosCategorias["default"];
            
            // Crear el contenedor de la sección de esta categoría
            const seccionCategoria = document.createElement("div");
            seccionCategoria.className = "mb-5";

            // Creamos el HTML del encabezado de la categoría y la fila (row) para sus tarjetas
            let htmlCategoria = `
                <h3 class="text-warning mb-3 mt-4">
                    <i class="${icono}"></i> ${categoria}
                </h3>
                <div class="row g-3">
            `;

            // Renderizar las tarjetas de noticias pertenecientes a esta categoría
            noticiasAgrupadas[categoria].forEach(noticia => {
                // Si la noticia no tiene imagen, usamos una por defecto para que no quede vacía
                const imagenUrl = noticia.imagen || "https://via.placeholder.com/400x250?text=Sin+Imagen";

                htmlCategoria += `
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="card h-100 bg-dark text-white border-secondary">
                            <img src="${imagenUrl}" class="card-img-top" alt="${noticia.titulo}" style="height: 200px; object-fit: cover;">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title text-light" style="font-size: 1.1rem; line-height: 1.4;">
                                    ${noticia.titulo}
                                </h5>
                                <p class="card-text text-muted small mt-auto mb-2">
                                    <i class="far fa-calendar-alt"></i> ${noticia.fecha ? new Date(noticia.fecha).toLocaleDateString() : 'Reciente'}
                                </p>
                                <a href="${noticia.enlace}" target="_blank" class="btn btn-outline-warning btn-sm w-100 mt-2">
                                    Leer noticia <i class="fas fa-external-link-alt ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });

            htmlCategoria += `</div>`; // Cerramos el div de la fila (.row)
            seccionCategoria.innerHTML = htmlCategoria;
            
            // Añadimos la categoría completa a la pantalla
            zonaNoticias.appendChild(seccionCategoria);
        }

    } catch (error) {
        console.error("Error al obtener las noticias:", error);
        document.getElementById("zonaNoticias").innerHTML = `
            <div class="text-center text-danger my-5">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <div>Error al cargar las noticias. Por favor, intenta de nuevo más tarde.</div>
            </div>
        `;
    }
}

// Ejecutar la función apenas cargue la página
// document.addEventListener("DOMContentLoaded", cargarNoticias);




// --------------------------------------------------------
// --------------------------------------------------------
		function mostrarAjustes() {
			// 1. Ocultamos el reproductor de radio central
			document.getElementById("radio").style.display = "none";
			
			// 2. Inyectamos la estructura de ajustes
			const contenedor = document.getElementById("contenido");
			contenedor.innerHTML = `
				<div class="container py-4 text-white" style="margin-bottom: 100px;">
					<h3 class="text-warning mb-4">
						<i class="fas fa-sliders-h me-2"></i> Ajustes de la Estación
					</h3>
					
					<div class="row g-4">
						<div class="col-12 col-md-6">
							<div class="card bg-dark border-secondary text-white h-100 shadow-lg">
								<div class="card-body d-flex flex-column">
									<h5 class="card-title text-warning mb-3">
										<i class="fas fa-broadcast-tower me-2"></i> Transmisión de Audio
									</h5>
									<div class="mt-auto p-3 bg-opacity-10 bg-warning border border-warning rounded">
										<h6 class="text-warning mb-1 small fw-bold">
											<i class="fas fa-exclamation-triangle me-1"></i> ¿Problemas con el audio?
										</h6>
										<p class="text-light mb-2" style="font-size: 0.85rem;">
											Si la señal se congeló o no se escucha, fuerza una reconexión inmediata.
										</p>
										<button class="btn btn-warning btn-sm w-100 fw-bold" onclick="reportarCaidaSenal(this)">
											<i class="fas fa-sync-alt me-1"></i> Reconectar Señal
										</button>
									</div>
								</div>
							</div>
						</div>
						
						<div class="col-12 col-md-6">
							<div class="card bg-dark border-secondary text-white h-100 shadow-lg">
								<div class="card-body d-flex flex-column">
									<h5 class="card-title text-warning mb-3">
										<i class="fas fa-bolt me-2"></i> Rendimiento y Noticias
									</h5>
									<div class="mt-auto p-3 bg-opacity-10 bg-danger border border-danger rounded">
										<h6 class="text-danger mb-1 small fw-bold">
											<i class="fas fa-trash-alt me-1"></i> Optimización de espacio
										</h6>
										<p class="text-light mb-2" style="font-size: 0.85rem;">
											Limpia las imágenes y datos temporales guardados por la PWA en tu dispositivo.
										</p>
										<button class="btn btn-outline-danger btn-sm w-100 fw-bold" onclick="limpiarCacheApp(this)">
											<i class="fas fa-broom me-1"></i> Limpiar Caché y Datos
										</button>
									</div>
								</div>
							</div>
						</div>
						
						<div class="col-12">
							<div class="card bg-dark border-secondary text-white shadow-lg text-center py-4">
								<div class="card-body">
									<div class="mb-3">
										<i class="fas fa-radio fa-3x text-warning"></i>
									</div>
									<h4 class="card-title text-warning mb-2">Frecuencia Manabita</h4>
									
									<p class="card-text mx-auto text-light-50" style="max-width: 650px; font-size: 0.95rem; line-height: 1.6;">
										Somos la plataforma radial y de información digital líder en el país. Llevamos entretenimiento, 
										buena música y noticias de última hora con los más altos estándares técnicos directamente 
										a tu dispositivo, sin cortes y sin complicaciones.
									</p>
									
									<hr class="border-secondary my-4 mx-auto" style="max-width: 300px;">
									
									<div class="d-flex justify-content-center gap-3">
										<a href="#" class="btn btn-outline-light btn-sm rounded-circle" style="width: 35px; height:35px;"><i class="fab fa-facebook-f mt-1"></i></a>
										<a href="#" class="btn btn-outline-light btn-sm rounded-circle" style="width: 35px; height:35px;"><i class="fab fa-instagram mt-1"></i></a>
										<a href="#" class="btn btn-outline-light btn-sm rounded-circle" style="width: 35px; height:35px;"><i class="fab fa-tiktok mt-1"></i></a>
										<a href="#" class="btn btn-outline-light btn-sm rounded-circle" style="width: 35px; height:35px;"><i class="fab fa-whatsapp mt-1"></i></a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
			
			// Activar menú
			activarMenu("btnAjustes");
		}



		// ============================================
		// RECONECTAR SEÑAL (funciona de verdad)
		// ============================================
		function reportarCaidaSenal(boton) {
			const textoOriginal = boton.innerHTML;
			
			boton.disabled = true;
			boton.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i> Reconectando streaming...`;
			
			// Cancelar cualquier reconexión automática pendiente
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
			
			// Forzar reconexión real del stream
			try {
				audio.pause();
				audio.src = "";               // limpiar buffer
				audio.load();
				
				// Reasignar la URL del stream
				audio.src = streamUrl + "?t=" + Date.now(); // evita caché del navegador
				audio.volume = currentVolume;
				
				// Intentar reproducir
				audio.play().then(() => {
					isPlaying = true;
					playIcon.classList.replace('fa-play', 'fa-pause');
					reconnectAttempts = 0;
					updateLiveStatus();
					
					// Éxito visual
					boton.className = "btn btn-success btn-sm w-100 fw-bold";
					boton.innerHTML = `<i class="fas fa-check me-1"></i> ¡Señal Restablecida!`;
					
					setTimeout(() => {
						boton.className = "btn btn-warning btn-sm w-100 fw-bold";
						boton.innerHTML = textoOriginal;
						boton.disabled = false;
					}, 2500);
					
				}).catch((err) => {
					console.error("Error al reconectar:", err);
					boton.className = "btn btn-danger btn-sm w-100 fw-bold";
					boton.innerHTML = `<i class="fas fa-times me-1"></i> Error al reconectar`;
					
					setTimeout(() => {
						boton.className = "btn btn-warning btn-sm w-100 fw-bold";
						boton.innerHTML = textoOriginal;
						boton.disabled = false;
					}, 3000);
				});
				
			} catch (e) {
				console.error(e);
				boton.disabled = false;
				boton.innerHTML = textoOriginal;
			}
		}

		// ============================================
		// LIMPIAR CACHÉ Y DATOS (PWA)
		// ============================================
		async function limpiarCacheApp(boton) {
			if (!confirm("¿Estás seguro de que deseas optimizar la app?\nSe borrarán imágenes y datos temporales guardados.")) {
				return;
			}
			
			const textoOriginal = boton.innerHTML;
			boton.disabled = true;
			boton.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i> Optimizando almacenamiento...`;
			
			try {
				// 1. Limpiar localStorage y sessionStorage
				localStorage.clear();
				sessionStorage.clear();
				
				// 2. Limpiar todas las caches de la PWA
				if ('caches' in window) {
					const names = await caches.keys();
					await Promise.all(names.map(name => caches.delete(name)));
				}
				
				// 3. Intentar borrar IndexedDB (si existe)
				if ('indexedDB' in window && indexedDB.databases) {
					const dbs = await indexedDB.databases();
					await Promise.all(dbs.map(db => {
						return new Promise((resolve) => {
							const req = indexedDB.deleteDatabase(db.name);
							req.onsuccess = resolve;
							req.onerror = resolve;
							req.onblocked = resolve;
						});
					}));
				}
				
				// Éxito visual
				boton.className = "btn btn-success btn-sm w-100 fw-bold";
				boton.innerHTML = `<i class="fas fa-check me-1"></i> ¡Aplicación Optimizada!`;
				
				setTimeout(() => {
					alert("Caché liberada con éxito.\nLa aplicación ahora está más ligera.");
					
					// Opcional: recargar para aplicar cambios
					// location.reload();
					
					boton.className = "btn btn-outline-danger btn-sm w-100 fw-bold";
					boton.innerHTML = textoOriginal;
					boton.disabled = false;
				}, 1800);
				
			} catch (error) {
				console.error("Error al limpiar caché:", error);
				boton.className = "btn btn-danger btn-sm w-100 fw-bold";
				boton.innerHTML = `<i class="fas fa-times me-1"></i> Error al limpiar`;
				
				setTimeout(() => {
					boton.className = "btn btn-outline-danger btn-sm w-100 fw-bold";
					boton.innerHTML = textoOriginal;
					boton.disabled = false;
				}, 2500);
			}
		}

		// Inicializar
		updateLiveStatus();
		updateSliderColor();
		//updateStatus("Listo", "text-muted");


