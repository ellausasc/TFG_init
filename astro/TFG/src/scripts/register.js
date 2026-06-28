// src/scripts/register.js

const form = document.getElementById("form");
const result = document.getElementById("result");

// Define la URL de tu servidor GraphQL
const GRAPHQL_URL = "http://localhost:4000/graphql"; 

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    form.classList.add("was-validated");
    
    // 1. Validación nativa del navegador
    if (!form.checkValidity()) {
      form.querySelectorAll(":invalid")[0].focus();
      return;
    }
    
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);

    // 2. Validación de contraseñas coincidentes en cliente
    if (object.password !== object.password_confirm) {
      result.innerHTML = "Les contrasenyes no coincideixen!";
      result.classList.add("text-red-500");
      result.style.display = "block";
      return;
    }

    // 3. Mapear los nombres del formulario HTML al Input de GraphQL
    const mutationInput = {
      first_name: object.nom,
      last_name_1: object.cognom1,
      last_name_2: object.cognom2 || null, 
      dni: object.dni,
      phone: object.telefon || null,
      email: object.email,
      password: object.password,
      birth_date: object.data_naixement, 
      roles: ["MEMBER"], 
      sections: []
    };

    // 4. Definición de la Mutation GraphQL
    const graphqlQuery = {
      query: `
        mutation Register($input: RegisterUserInput!) {
          registerUser(input: $input) {
            token
            user {
              id
              first_name
              email
            }
          }
        }
      `,
      variables: {
        input: mutationInput
      }
    };

    // Estilos de "Enviando..."
    result.innerHTML = "Enviant dades...";
    result.classList.remove("text-red-500", "text-green-500");
    result.classList.add("text-gray-600");
    result.style.display = "block";

    // 5. Envío de la petición a GraphQL
    fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then(async (response) => {
        const resBody = await response.json();

        if (resBody.errors && resBody.errors.length > 0) {
          throw new Error(resBody.errors[0].message);
        }

        if (response.ok && resBody.data) {
          const { token, user } = resBody.data.registerUser;
          
          // Guardar el JWT en el cliente
          localStorage.setItem("token", token);

          result.classList.replace("text-gray-600", "text-green-500");
          result.innerHTML = `Registre correcte! Benvingut/da ${user.first_name}.`;
          
          form.reset();
          form.classList.remove("was-validated");
        } else {
          throw new Error("Error desconegut en el registre.");
        }
      })
      .catch((error) => {
        console.error(error);
        result.classList.replace("text-gray-600", "text-red-500");
        result.innerHTML = error.message || "Hi ha hagut un error en enviar el formulari!";
      })
      .then(function () {
        setTimeout(() => {
          result.style.display = "none";
        }, 5000);
      });
  });
}