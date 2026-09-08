# BS JOKI — Assets Folder

## Overview

Folder ini digunakan untuk menyimpan asset digital (gambar, logo, banner, dll.) jika tersedia di masa mendatang.

Saat ini, **BS JOKI** tidak menggunakan asset eksternal. Semua visual dibangun menggunakan:
- Inline SVG
- CSS gradients
- CSS shapes
- Emoji
- CSS pseudo-elements

## Kenapa Tanpa Asset Eksternal?

Website ini dirancang untuk langsung berfungsi tanpa perlu mengunduh atau menyimpan file gambar tambahan. Semua ikon, logo, dan visual dihasilkan langsung dari CSS dan SVG inline.

## Jika Ingin Menambahkan Asset

Jika kamu ingin menambahkan asset di masa depan, letakkan file di folder ini dan referensikan dengan path yang tepat:

```html
<!-- Contoh untuk halaman di root -->
<img src="assets/logo.png" alt="BS JOKI Logo">

<!-- Contoh untuk halaman di folder pages/ -->
<img src="../assets/logo.png" alt="BS JOKI Logo">