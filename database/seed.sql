-- Bloque de seleccion de esquema para carga de datos iniciales.
USE tienda_redes;

-- Bloque de usuarios de ejemplo (password hashes de demostracion).
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Admin Tienda', 'admin@tiendaredes.com', '$2a$10$EjemploHashAdminNoUsarEnProduccion', 'admin'),
('Cliente Demo', 'cliente@tiendaredes.com', '$2a$10$EjemploHashClienteNoUsarEnProduccion', 'cliente');

-- Bloque de categorias de productos de redes.
INSERT INTO categorias (nombre, slug, descripcion) VALUES
('Routers', 'routers', 'Equipos de enrutamiento para hogar y empresa'),
('Switches', 'switches', 'Conmutadores administrables y no administrables'),
('Access Points', 'access-points', 'Cobertura WiFi empresarial y residencial'),
('Firewalls', 'firewalls', 'Seguridad perimetral y control de trafico'),
('Servidores NAS', 'servidores-nas', 'Almacenamiento en red para respaldo y archivos'),
('Cableado', 'cableado', 'Infraestructura fisica de red y conectividad');

-- Bloque de catalogo de productos referenciando categoria_id.
INSERT INTO productos (nombre, slug, descripcion, precio, stock, categoria_id, imagen, specs_json) VALUES
('Router AX3000', 'router-ax3000', 'Router WiFi 6 doble banda para alto rendimiento', 520000, 25, 1, 'router-ax3000.jpg', '{"wifi":"802.11ax","puertos_lan":4}'),
('Switch 24 Puertos Gigabit', 'switch-24-puertos-gigabit', 'Switch capa 2 con soporte de VLAN', 840000, 12, 2, 'switch-24.jpg', '{"puertos":24,"gestion":"si"}'),
('Access Point WiFi 6', 'access-point-wifi-6', 'Cobertura inteligente con roaming continuo', 710000, 18, 3, 'ap-wifi6.jpg', '{"wifi":"802.11ax","poe":"si"}'),
('Firewall UTM SMB', 'firewall-utm-smb', 'Proteccion para pequenas y medianas empresas', 1650000, 7, 4, 'firewall-utm.jpg', '{"vpn":"si","ips":"si"}'),
('Servidor NAS 4 Bahias', 'servidor-nas-4-bahias', 'Almacenamiento centralizado con RAID', 2100000, 5, 5, 'nas-4-bahias.jpg', '{"bahias":4,"raid":"0/1/5"}'),
('Cable UTP Cat6 x 305m', 'cable-utp-cat6-305m', 'Bobina de cable estructurado categoria 6', 390000, 30, 6, 'cable-cat6.jpg', '{"longitud_metros":305,"categoria":"cat6"}');

-- Bloque de orden de ejemplo para pruebas de JOIN y reportes.
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio) VALUES
(2, 1360000, 'pendiente', 'Calle 10 #20-30, Bogota');

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 520000),
(1, 2, 1, 840000);

-- Bloque de carrito persistente para usuario demo.
INSERT INTO carritos (usuario_id, producto_id, cantidad) VALUES
(2, 3, 1),
(2, 6, 2);
