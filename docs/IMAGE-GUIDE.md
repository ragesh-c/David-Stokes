# Image Guide — David Stokes Website

Replace each `.img-placeholder` div with a real `<img>` tag once the actual files are ready.

## Image replacement pattern

Replace:
```html
<div class="img-placeholder" style="width:400px; height:580px;">hero-book-cover.jpg<br>400 × 580px</div>
```

With:
```html
<img src="images/hero-book-cover.jpg" alt="King Alfred's Daughter book cover" width="400" height="580" loading="lazy">
```

Always include:
- `alt` attribute (describe the image, don't just repeat the filename)
- `width` and `height` attributes (prevents layout shift)
- `loading="lazy"` on all images below the fold

---

## Required Images

### Hero & Portrait
| Filename | Dimensions | Description |
|---|---|---|
| `hero-book-cover.jpg` | 320 × 460px | King Alfred's Daughter cover — hero section |
| `about-portrait.jpg` | 480 × 580px | Professional author portrait — about teaser, speaking section |
| `about-portrait-wide.jpg` | 1200 × 525px minimum | Full-width portrait — about page banner |

### Book Covers
| Filename | Ratio | Description |
|---|---|---|
| `cover-king-alfreds-daughter.jpg` | 2:3 | King Alfred's Daughter front cover |
| `cover-angles-or-angels.jpg` | 2:3 | Angles or Angels? front cover |
| `cover-sermon-of-the-wolf.jpg` | 2:3 | Sermon of the Wolf front cover (from Foreshore Books) |
| `cover-the-happy-ending.jpg` | 2:3 | The Happy Ending front cover |
| `cover-the-singing-bowl.jpg` | 2:3 | The Singing Bowl front cover |

### Author Photos (for Media page)
| Filename | Ratio | Description |
|---|---|---|
| `author-photo-1.jpg` | 3:4 | Professional portrait (vertical) |
| `author-photo-2.jpg` | 3:4 | Second professional portrait (vertical) |
| `author-photo-3.jpg` | 1:1 | Square crop for social/editorial use |

### Journal Post Images
Each image should show the location described in the post. Landscape, 16:9 ratio.

| Filename | Post | Location |
|---|---|---|
| `journal-leicester.jpg` | Finding Æthelflæd in Leicester | Leicester Guildhall or Cathedral |
| `journal-shrewsbury.jpg` | Finding Æthelflæd in Shrewsbury | Shrewsbury town / River Severn |
| `journal-warwick.jpg` | Finding Æthelflæd in Warwick | Warwick town / St Mary's Church |
| `journal-derby.jpg` | Finding Æthelflæd in Derby | Derby Cathedral or town centre |
| `journal-coronation.jpg` | The Coronation Oath | Westminster Abbey or coronation imagery |
| `journal-worcester.jpg` | Finding Æthelflæd in Worcester | Worcester Cathedral |
| `journal-chester.jpg` | Finding Æthelflæd in Chester | Chester Roman Walls |
| `journal-gloucester.jpg` | Gloucester — Æthelflæd's Capital | Gloucester Cathedral or St Oswald's Priory |
| `journal-tamworth.jpg` | Finding Æthelflæd in Tamworth | Tamworth Castle or statue |
| `journal-kingston.jpg` | Kingston's Coronation Stone | Coronation Stone, Kingston-upon-Thames |

### Press & Downloads
| Filename | Type | Description |
|---|---|---|
| `david-stokes-press-kit.pdf` | PDF | Full press kit (bio + covers + photos) |

---

## Image optimisation
- Compress JPEGs to 80–85% quality (use Squoosh, ImageOptim, or similar)
- Target: hero images < 200KB, journal images < 150KB, book covers < 100KB
- Use WebP format if possible (add JPEG fallback for older browsers via `<picture>`)
- All images should be sRGB colour profile
