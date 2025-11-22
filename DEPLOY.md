# Guía de Deploy - Base Contract IQ

## 🚀 Deploy Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables
cp .env.example .env
# Edita .env y añade tu ETHERSCAN_API_KEY

# 3. Test local
npm run dev

# 4. Deploy a Vercel
vercel
```

## 📋 Checklist Post-Deploy

### 1. Generar Iconos
- [ ] Ve a https://realfavicongenerator.net/
- [ ] Sube `public/icon.svg`
- [ ] Descarga los archivos generados
- [ ] Colócalos en `public/`:
  - `icon-192.png`
  - `icon-512.png`
  - `favicon.ico`
  - `og-image.png` (o crea uno personalizado)

### 2. Configurar Farcaster Manifest

- [ ] Edita `public/.well-known/farcaster.json`
- [ ] Reemplaza `your-domain.com` con tu dominio real (ej: `base-contract-iq.vercel.app`)
- [ ] Actualiza `iconUrl` → `https://tu-dominio.com/icon.png`
- [ ] Actualiza `homeUrl` → `https://tu-dominio.com`
- [ ] Actualiza `canonicalDomain` → `tu-dominio.com`

### 3. Firmar el Manifest

Elige una opción:

**Opción A: Base Build (Recomendado)**
1. Ve a https://base.dev
2. Sign in con tu cuenta Base
3. Preview → Account Association
4. Ingresa tu dominio completo
5. Click Submit → Verify → Sign
6. Firma con tu wallet
7. Copia el objeto `accountAssociation` completo
8. Pégalo en `public/.well-known/farcaster.json` reemplazando el existente

**Opción B: Farcaster**
1. Ve a https://farcaster.xyz
2. Login
3. Developers → Manifest Tool
4. Ingresa tu dominio (sin https://)
5. Click Refresh
6. Generate Account Association
7. Copia y pega en `public/.well-known/farcaster.json`

### 4. Re-deploy
```bash
git add .
git commit -m "Update manifest with domain and signature"
git push
# O si usas Vercel CLI:
vercel --prod
```

### 5. Verificar

- [ ] Visita `https://tu-dominio.com/.well-known/farcaster.json`
- [ ] Debe devolver JSON válido
- [ ] Verifica en Base Build que muestra 3 checkmarks verdes
- [ ] O verifica en Farcaster Manifest Tool

## 🔧 Variables de Entorno en Vercel

En el dashboard de Vercel:
1. Settings → Environment Variables
2. Añade:

```
ETHERSCAN_API_KEY=tu_api_key_aqui
BASE_RPC_URL=https://mainnet.base.org
```

**Nota:** Usa Etherscan API V2 unificado. Obtén tu key en https://etherscan.io/myapikey
Una sola API key funciona para todas las chains (Ethereum, Base, Polygon, etc.)

3. Aplica a: Production, Preview, Development
4. Redeploy

## ✅ Verificación Final

- [ ] App carga en `https://tu-dominio.com`
- [ ] Manifest accesible en `/.well-known/farcaster.json`
- [ ] Iconos se muestran correctamente
- [ ] Form de análisis funciona
- [ ] Responsive en móvil
- [ ] Base Build muestra checkmarks verdes

## 🎯 Registrar en Base

1. Ve a https://base.dev
2. Navega a tu app
3. Completa el registro
4. Tu app aparecerá en el directorio de Base mini apps

## 🐛 Troubleshooting

**Error: manifest no accesible**
- Verifica `next.config.js` tiene headers configurados
- Check `public/.well-known/` existe y tiene `farcaster.json`
- Redeploy

**Error: firma inválida**
- Regenera `accountAssociation` en Base Build o Farcaster
- Asegúrate de copiar el objeto completo (header, payload, signature)
- Dominio en manifest debe coincidir exactamente

**Error: iconos no cargan**
- Verifica rutas en `manifest.json` y `farcaster.json`
- Regenera iconos desde `icon.svg`
- Check que archivos PNG existen en `public/`
