const socket = io('http://localhost:3000')


        if (Notification.permission !== 'granted') {
            Notification.requestPermission()
        }           

        let sender = ''
        let receiver = ''

        //Mensagem que o usuário digita
        let message = document.getElementById('message');
        let form = document.getElementById('formMessages')


        socket.on('name', (username)=>{
            sender = username
            
        })

        let arrayUsers = []

        //Mostrar usuários online
        socket.on('user', (users)=>{

            arrayUsers = []

            document.getElementById('user-list').innerHTML = ''
            
            users.forEach((element)=>{
                if(element.name != sender && arrayUsers.indexOf(element.name) == -1 && element.name != ''){
                    let html = `<div id="${element.name}"><li class="usersList" onclick="onUserSelected(this.innerText)">${element.name}</li><span id="status">Online</span></div>`
                    document.getElementById('user-list').innerHTML += html

                    arrayUsers.push(element.name)
                }
            })


        })



        //Função que recebe o destinatário da mensagem
        function onUserSelected(username){
            receiver = username

            document.getElementById('chat_area').style.display = 'flex'
            document.getElementById('contato').innerHTML = username 


            let historico = {
                sender1: sender,
                receiver1: receiver,
                sender2: receiver,
                receiver2: sender
            }

            socket.emit('chat_on', historico)

            document.getElementById('messages').innerHTML = ''

        }



        //Função que envia a mensagem para o servidor
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = new Date()

            let dia = data.getDate()
            let mes = data.getMonth() + 1
            let ano = data.getFullYear()
            let horas = data.getHours()
            let minutos = data.getMinutes()

            dia = dia < 10 ? dia.toString().padStart(2, '0') : dia
            mes = mes < 10 ? mes.toString().padStart(2, '0') : mes

            let string = `${dia}/${mes}/${ano} ${horas}:${minutos}`

            let new_Message = message.value.trim()

            if (new_Message) {
              socket.emit('send_message', 
              //Objeto com os dados de usuários e a mensagem
                {
                    receiver: receiver,
                    sender: sender,
                    message: message.value,
                    date: string
                }
              );

              let messages = document.getElementById('messages')

              messages.innerHTML += '<div class="messageMe">' + message.value + '</div>'
              const chatContainer = document.getElementById("messages");
              chatContainer.scrollTop = chatContainer.scrollHeight;

              message.value = '';

            }
        });


        //Socket que recebe novas mensagens e imprime no navegador
        socket.on('new_message', (data)=>{

            if (Notification.permission === 'granted') {
                
                let notification = new Notification("Chat Web", {
                    icon: './comment-regular.svg',
                    body: data.sender + ': Nova Mensagem'
                });
            
                notification.onclick = () => {
                    onUserSelected(data.sender);
                };
            }

            if(receiver == data.sender){
                document.getElementById('messages').innerHTML += '<div class="message">' + data.message + '</div>'
                const chatContainer = document.getElementById("messages");
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

        })


        //Histórico de conversas
        socket.on('messages_hist', (data)=>{ 

            let arrayHistorico = data

            arrayHistorico.forEach((obj)=>{
                let messages = document.getElementById('messages')
                if(obj.sender == sender){
                    messages.innerHTML += '<div class="messageMe">' + obj.message + '</div>'
                }else{
                    messages.innerHTML += '<div class="message">' + obj.message + '</div>'
                }
            })
        })



        //Exibir o menu "hamburguer"
        function showList(){
            if(document.getElementById('menu_toggle').checked){
                document.getElementById('sidebar').style.display = 'flex'
                document.getElementById('chat_area').style.display = 'none'
            }else{
                document.getElementById('sidebar').style.display = 'none'
            }
        }

        function selectUser(){
            if(window.innerWidth < 769){
                document.getElementById('sidebar').style.display = 'none'
                document.getElementById('menu_toggle').checked = false; // <- aqui resolve o problema
            }
        }


        //Desconexao de usuarios
        socket.on('off', (userOff)=>{

            let userInList = document.getElementById(userOff)
            let test = userInList.children[1]
            test.innerHTML = 'Offline'
            test.style.color = 'red'

        })