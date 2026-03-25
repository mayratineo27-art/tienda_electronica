-- =========================================================
-- Seed PostgreSQL para Supabase
-- =========================================================

-- Limpiar datos demo en orden correcto por FK.
TRUNCATE TABLE carritos, orden_items, ordenes, productos, categorias, usuarios RESTART IDENTITY CASCADE;

-- Usuarios demo.
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador Portafolio', 'admin@demo.com', '$2a$12$DemoHashAdminParaPortafolio', 'admin'),
('Ana Ingeniera', 'ana@demo.com', '$2a$12$DemoHashClienteParaPortafolio', 'cliente'),
('Carlos Redes', 'carlos@demo.com', '$2a$12$DemoHashClienteParaPortafolio', 'cliente');

-- Categorias demo.
INSERT INTO categorias (nombre, slug, descripcion) VALUES
('Routers', 'routers', 'Equipos de enrutamiento para hogar y pyme'),
('Switches', 'switches', 'Conmutadores L2 y L3 para segmentacion de red'),
('Access Points', 'access-points', 'Cobertura WiFi empresarial'),
('Firewalls', 'firewalls', 'Seguridad perimetral y control de trafico'),
('Servidores NAS', 'servidores-nas', 'Almacenamiento centralizado en red'),
('Cableado', 'cableado', 'Cableado estructurado y accesorios');

-- Productos demo.
INSERT INTO productos (nombre, slug, descripcion, precio, stock, categoria_id, imagen, specs_json) VALUES
('Router WiFi 6 AX3000', 'router-wifi6-ax3000', 'Router dual band con OFDMA para baja latencia', 520000, 20, 1, 'router-ax3000.jpg', '{"puertos_lan":4,"wifi":"802.11ax"}'),
('Switch Gestionable 24P', 'switch-gestionable-24p', 'Switch administrable con VLAN y QoS', 890000, 14, 2, 'switch-24p.jpg', '{"puertos":24,"poe":"no"}'),
('Access Point AX1800', 'access-point-ax1800', 'AP para oficinas con roaming', 740000, 17, 3, 'ap-ax1800.jpg', '{"ssid":8,"wifi":"802.11ax"}'),
('Firewall UTM SMB', 'firewall-utm-smb', 'Firewall para pymes con VPN IPSec', 1680000, 8, 4, 'firewall-utm.jpg', '{"vpn":"ipsec","throughput_mbps":1200}'),
('NAS 4 Bahias RAID', 'nas-4-bahias-raid', 'Servidor NAS para backup y archivos empresariales', 2150000, 6, 5, 'nas-4-bahias.jpg', '{"bahias":4,"raid":"0/1/5/10"}'),
('Cable UTP Cat6 305m', 'cable-utp-cat6-305m', 'Bobina de cable categoria 6 para instalaciones', 395000, 40, 6, 'cable-cat6.jpg', '{"longitud_metros":305,"categoria":"cat6"}');

-- Ordenes demo.
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio, created_at) VALUES
(2, 1410000, 'pagada', 'Calle 80 #15-22, Bogota', NOW() - INTERVAL '5 days'),
(3, 520000, 'pendiente', 'Carrera 48 #9-30, Medellin', NOW() - INTERVAL '1 day');

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(1, 2, 1, 890000),
(1, 6, 1, 395000),
(1, 1, 1, 125000),
(2, 1, 1, 520000);

INSERT INTO carritos (usuario_id, producto_id, cantidad) VALUES
(2, 3, 1),
(2, 4, 1),
(3, 6, 2);
