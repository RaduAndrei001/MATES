
# Coding Guidelines & SOLID Principles

Acest document descrie regulile de codare urmate în proiect și modul în care sunt aplicate principiile SOLID pentru a menține un cod clar, scalabil și ușor de întreținut.



## Coding Guidelines

### Naming Conventions

- **Fișiere**: `camelCase` pentru fișiere JS/React (`postService.js`, `authRepository.js`)
- **Componente React**: `PascalCase` (`CommunityPage.jsx`, `LoginForm.jsx`)
- **Funcții & Variabile**: `camelCase` (`getPosts`, `handleLogin`)
- **Clase și Obiecte**: `PascalCase` (`PostRepository`, `UserFactory`)



### Structură de foldere

Organizarea codului este modulară, respectând separarea responsabilităților:

- `factories/` – creează obiecte de tip Post, Comment, User etc.
- `repositories/` – conține logica de interacțiune cu baza de date (Firestore)
- `services/` – conține logica de business (filtrări, sortări, prelucrări date)
- `components/` – componente UI reutilizabile
- `pages/` – pagini principale ale aplicației (Home, Profile, GamePage etc.)



### Bune practici

- Separare clară între logică și UI
- Datele sunt accesate prin servicii și repository-uri, nu direct în componente
- Comentarii doar acolo unde logica devine mai complexă
- Fără hardcodări – se folosesc `props`, `state` sau date din Firebase



## Principiile SOLID

### **S - Single Responsibility Principle**
> Fiecare clasă sau modul are o singură responsabilitate.

-  `PostRepository.js` se ocupă doar de interacțiunea cu Firestore.
-  `PostFactory.js` creează doar obiecte de tip Post sau Comment.



### **O - Open/Closed Principle**
> Codul este deschis pentru extensie, dar închis pentru modificare.

-  `PostService.js` poate fi extins cu funcționalități (ex: like-uri), fără a modifica logica existentă.



### **L - Liskov Substitution Principle**
> Obiectele dintr-o subclasă pot înlocui obiectele din clasa părinte.

-  Chiar dacă nu folosim moștenire, funcțiile sunt construite astfel încât pot fi înlocuite fără să afecteze logica dependentă.



### **I - Interface Segregation Principle**
> Nu forțăm clasele să implementeze metode pe care nu le folosesc.

-  Fiecare modul are scop clar: Factory creează, Repository citește/scrie, Service aplică logică.



### **D - Dependency Inversion Principle**
> Modulele de nivel înalt nu depind de cele de nivel jos, ci de abstracții.

-  `PostService` depinde de `PostRepository`, care poate fi înlocuit fără să afecteze logica de business.



## Locație fișier

Acest fișier trebuie păstrat în root-ul aplicației frontend:  
`Steam-clone-5/frontend/CODING_GUIDELINES.md`
