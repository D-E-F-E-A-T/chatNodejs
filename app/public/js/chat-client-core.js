var boxMsg = document.querySelector('#msgBox');

jQuery(function(){
	
	jQuery('#msgBox').animate({scrollTop: boxMsg.scrollHeight}, '1000');
	
	jQuery('#formmsg').on('submit', function(event){
		event.preventDefault();
		var msg = jQuery('#txtmsg').val();
		var userId = jQuery('#userId').val();
		var nick = jQuery('#userNick').val();
		
		if(msg != ''){
			jQuery.ajax({
				type: 'POST',
				url: '/chat/messages',
				data: {msg: msg, idUser: userId, nick},
				dataType: 'json',
				success: function(response){
					if(response == 'ok'){
						jQuery('#txtmsg').val('');

						var date = new Date();
						
						var minutes = (date.getMinutes > 10)? "0"+date.getMinutes(): date.getMinutes();
						var time = date.getHours()+":"+minutes;
						
						var message = '<div class="container msg darker">';
						message += '<p>'+msg+'</p>';
						message += '<span class="time-left">'+time+'</span>';
						message += '</div>';

						jQuery('#msgBox').append(message);
						jQuery('#msgBox').animate({scrollTop: boxMsg.scrollHeight}, '500');
			
					}else{
						alert('Ocorreu um erro ao enviar a mensagem');
					}
				}
			});
		}
	});

	history.pushState({}, "", "");
	window.onpopstate = function(event) {
		var userId = $('#userId').val();

		jQuery.ajax({
			type: 'GET',
			url: '/users/logout/'+userId,
			success: function(response){
				location.reload();
			}
		});
		event.preventDefault();
	};


	var socket = io();
	socket.on('message', function(data){
		var userId = jQuery('#userId').val();
		if(data.idUser != userId){

			var msg = '<div class="container msg">';
			msg += '<h5>'+data.nick+'</h5><hr>';
			msg += '<p>'+data.msg+'</p>';
			msg += '<span class="time-right">'+data.msgTime+'</span>';
			msg += '</div>';

			jQuery('#msgBox').append(msg);
			jQuery('#msgBox').animate({scrollTop: boxMsg.scrollHeight}, '500');
		
		}
	});

	socket.on('userLogin', function(data){
		var userId = $('#userId').val();
		if(data.idUser != userId){
			var msg = '<div class="container msg login">';
			msg += '<h6 align="center">'+data+' entrou</h6>';
			msg += '</div>';

			jQuery('#msgBox').append(msg);
			jQuery('#msgBox').animate({scrollTop: boxMsg.scrollHeight}, '500');
		
		}
	});

	socket.on('userLogout', function(data){
		var userId = $('#userId').val();
		if(data.idUser != userId){
			var msg = '<div class="container msg login">';
			msg += '<h6 align="center">'+data+' saiu</h6>';
			msg += '</div>';

			jQuery('#msgBox').append(msg);
			jQuery('#msgBox').animate({scrollTop: boxMsg.scrollHeight}, '500');
		
		}
	});
});	
