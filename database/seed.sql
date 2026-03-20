-- Bloque de seleccion de esquema para carga de datos iniciales.
USE tienda_redes;

-- Bloque de inserciones de productos de redes para pruebas funcionales.
INSERT INTO products (name, description, price, stock, category, is_active) VALUES
('Router AX3000', 'Router WiFi 6 doble banda para hogar y oficina', 129.90, 25, 'Routers', 1),
('Switch 24 Puertos Gigabit', 'Switch administrable capa 2 con VLAN', 210.00, 12, 'Switches', 1),
('Access Point WiFi 6', 'Punto de acceso empresarial con roaming', 185.50, 18, 'Access Points', 1),
('Firewall UTM SMB', 'Firewall para pequenas y medianas empresas', 399.99, 7, 'Firewalls', 1),
('Servidor NAS 4 Bahias', 'Almacenamiento en red para respaldo centralizado', 520.00, 5, 'Servidores NAS', 1),
('Cable UTP Cat6 x 305m', 'Bobina de cable estructurado categoria 6', 115.00, 30, 'Cableado', 1);
