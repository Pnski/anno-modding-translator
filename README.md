# Anno Modding Translator

This project is not affiliated in any way with Ubisoft.

Anno 1800 is a trademark of Ubisoft Entertainment in the US and/or other countries. Anno is a trademark of Ubisoft GmbH in the US and/or other countries.

## Feature Overview

- [ModInfo.Json](#Modinfo.json)
  - 
- [Texts](#Texts)
  - Navigate via Outline
  - Jump to asset from any GUID by right click or `Ctrl+T`
- Commands
  - [Compare](#command-compare): Apply mod and compare unpatched vs patched
  - [Build and Deploy](./doc/annomod.md): Copy your mod to the `mods/` folder and generate DDS (with LODs) and other files automatically.
  - [Import from Blender or glTF](#import-from-blender-or-gltf) to `.cfg`, `.ifo` and `.cf7`
  - Various right-click utilities to convert between Anno and editable formats (glTF, PNG, ...)
- Auto-completion
  - [GUID conversion](#guid-conversion)
  - [Assets XML auto completion](#auto-completion)
- Other
  - [Reskin existing models](#quickly-reskin-existing-models) without touching `.cfg`, ...

See [Feature Details](#feature-details) for more, or [CHANGELOG](./CHANGELOG.md) for recent changes.

---

## Setup

tbd

### 
---

## Shortcuts
| Keybind | Command |
| --- | --- |
| ctrl+alt+t | Modinfo |
| ctrl+alt+z | Single Texts |
| ctrl+alt+y | Inline |

---
## Feature Details

### ModInfo.json

### Texts_Lang.xml

Asynchronus Task, you can run multiple at the same time, but its getting lots of errors in my tests, therefor a new command will come in the future!

Translates the \<Text\> of a single document. The translation is trying to autodetect the given language and will translate it to the language of the filename.



---

## Credits


## ToDo

- https://github.com/heliomar-pena/i18n-populator