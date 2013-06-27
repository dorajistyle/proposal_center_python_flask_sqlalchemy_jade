var show_message,show_warning_msg,show_error_msg,show_info_msg,show_success_msg;

show_log = function(msg) {
    if( console && console.log ) {
       console.log("로그 :", msg);
    }
};

show_message = function(msg,type) {
    $msg_box = $('#message_'+type);
    $msg_box.html(msg);
    $msg_box.fadeIn(200).removeClass('hidden').delay(400).fadeOut(700);
};

show_warning_msg = function(msg) {
    show_message(msg,"alert-warning");
};

show_error_msg = function(msg) {
    show_message(msg,"alert-error");
};

show_info_msg = function(msg) {
    show_message(msg,"alert-info");
};

show_success_msg = function(msg) {
    show_message(msg,"alert-success");
};

send_by_ajax = function(url,data) {
    xhr = $.ajax({url: url,dataType: 'json', data:  data, type: 'POST'});
    xhr.fail(function ( data ) {
        show_error_msg("서버와의 통신에 실패하였습니다.(Sorry, Server Error.");
    });
    return xhr;
};

send_by_ajax_url_only = function(url) {
    return send_by_ajax(url,'');
};

show_one_more_page = function(baseURL) {
   var $more_btn = $($('#tabs').find('.more_btn'));
   $more_btn.off('click');
   $more_btn.on('click', function (e) {
        var $more,next_page,tab_name;
        $more = $(e.target);
        next_page = $more.data('page');
        tab_name = $more.data('tab');
        $($('#tabs').find('.more')).replaceWith('<span/>');
        $($('#tabs').find('.feedbacks')).append($('<div/>').load(baseURL+tab_name+'/'+next_page+'/', function() {
            vote_item();
            show_one_more_page(baseURL);
        }));
    });
};

vote_item = function() {
    var $vote_items;
    $vote_items =  $($('#tabs').find('ul.list > li.item > ul > li.vote'));
    $vote_items.off('click');
    $vote_items.on('click', function (e) {
        var $target,xhr;
        $target = $(e.target);
        if($target.hasClass('vote_count') || $target.hasClass('vote_icon')){
            $target = $(e.target.parentNode.parentNode);
        } else if($target.hasClass('inner_list')){
            $target = $(e.target.parentNode);
        }
        if($target.hasClass('disabled')){
            return false;
        }
        xhr = send_by_ajax_url_only('/vote/'+$target.data('id')+'/');
        xhr.done(function ( data ) {
          var vote_count,feedback_id,$item,$counter;
          vote_count = data['vote_count'];
          feedback_id = data['feedback_id'];
          $item = $('#item_'+feedback_id);
          $counter = $('#counter_'+feedback_id);
          $counter.html(vote_count);
          $item.addClass('disabled');
          $item.removeClass('btn-warning');
          show_success_msg("추천에 성공했습니다.(Success the vote)");
        });
    });

};

$(function () {
    var baseURL = "/tab/";
    $('#proposal_tab').tab();
    ($('#pp_buttons_radio').find('.btn')).on('click',function(){
       $('#propose_type').val(this.value);
        var categoryId = this.value;
        textMessage = "";
        if (categoryId == 1) {
          textMessage = "웹에 제안하실 내용을 입력해주세요.(Enter text that you want to propse for web.)";
        } else if (categoryId == 2) {
          textMessage = "모바일에 제안하실 내용을 입력해주세요.(Enter text that you want to propse for mobile.)";
        } else if (categoryId == 3) {
          textMessage = "아이디어와 제안을 입력해주세요.(Enter text that you want to propse about your idea.)";
        } else {
          textMessage = "다른 사람은 모르는 나만의 이야기를 보내주세요. (Enter text that your story in our service.)";
        }
        $('#content').attr('placeholder', textMessage);
    });
    
    $("#feedback_form").submit(function () {
      var email_format = /^((\w|[\-\.])+)@((\w|[\-\.])+)\.([A-Za-z]+)$/;
      var email = $('input[name=email]').val();
      var content = $('textarea[name=content]').val();
      
      if (email.trim() == "" || email.search(email_format) == -1) {
          show_warning_msg("이메일을 입력해주세요.(Please enter an email address.)");
          $('input[name=email]').focus();
          return false;
      } else if (content.trim() == "") {
          show_warning_msg("내용을 입력해주세요.(Please enter a content.");
          $('textarea[name=content]').focus();
          return false;
      } else if (!$("#agreement").is(":checked")) {
          show_warning_msg("개인정보 이용방침에 동의해주세요(Please confirm the terms and conditions.");
          return false;
      }
    });
    $($('#proposal_tab').find('a')).click(function (e) {
      e.preventDefault();
      var tab,$tab;
      tab = $(e.target).attr('href');
      $($('#tabs').find('.tab-pane')).html('');
      $tab = $(tab);

      $tab.load(baseURL+tab.replace('#','')+'/1/', function(){
            $('#proposal_tab').tab();
            show_one_more_page(baseURL);
            vote_item();
       });
      $(this).tab('show');

    });
   show_one_more_page(baseURL);
   vote_item();


});
