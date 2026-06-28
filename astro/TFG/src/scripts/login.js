  const form = document.getElementById("form");
  const result = document.getElementById("result");
  
  // URL de tu servidor GraphQL
  const GRAPHQL_URL = "http://localhost:4000/graphql";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    form.classList.add("was-validated");
    
    if (!form.checkValidity()) {
      form.querySelectorAll(":invalid")[0].focus();
      return;
    }
    
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);

    // Definición de la Mutation GraphQL para Login
    const graphqlQuery = {
      query: `
        mutation Login($email: String!, $password: String!) {
          loginUser(email: $email, password: $password) {
            token
            user {
              first_name
            }
          }
        }
      `,
      variables: {
        email: object.email,
        password: object.password
      }
    };

    // Estilos de "Enviando..."
    result.innerHTML = "Iniciant sessió...";
    result.classList.remove("text-red-500", "text-green-500", "hidden");
    result.classList.add("text-gray-600", "block");

    fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then(async (response) => {
        const resBody = await response.json();

        // Manejo de errores de GraphQL (ej: Credenciales incorrectas)
        if (resBody.errors && resBody.errors.length > 0) {
          throw new Error(resBody.errors[0].message);
        }

        if (response.ok && resBody.data) {
          const { token, user } = resBody.data.loginUser;
          console.log(token, user);
          
          // Guardamos el token en localStorage
          localStorage.setItem("token", token);

          result.classList.replace("text-gray-600", "text-green-500");
          result.innerHTML = `Benvingut de nou, ${user.first_name}!`;
          
          // Redirigimos al panel privado
          setTimeout(() => {
            window.location.href = "/me";
          }, 1000); // 1 segundo de cortesía para ver el mensaje verde
          
        } else {
          throw new Error("Error desconegut en iniciar sessió.");
        }
      })
      .catch((error) => {
        console.error(error);
        result.classList.replace("text-gray-600", "text-red-500");
        result.innerHTML = error.message || "Hi ha hagut un error de connexió.";
      })
      .then(function () {
        form.classList.remove("was-validated");
      });
  });