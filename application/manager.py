# coding=UTF-8
from application import app
from datetime import datetime
from flask import render_template, request, redirect, url_for, jsonify
from application.models import *
this_year = str(datetime.now().year)
per_page = 3

def list_tab(propose_type,current_page,tab_name):
    feedback_page = Feedback.query.filter_by(propose_type=propose_type).order_by(Feedback.created_at.desc()).paginate(int(current_page), per_page)
    feedbacks = feedback_page.items
    has_next = feedback_page.has_next
    return render_template('main/feedbacks.jade',feedbacks = feedbacks, has_next = has_next, next_page = int(current_page)+1, tab_name = tab_name)


@app.route('/index/')
@app.route('/')
def list():
    feedback_page = Feedback.query.order_by(Feedback.created_at.desc()).paginate(1,per_page)
    feedbacks = feedback_page.items
    has_next = feedback_page.has_next
    return render_template('main/list.jade', title='제안 목록',this_year=this_year,feedbacks = feedbacks, has_next = has_next, next_page = 2, tab_name = 'all')

@app.route('/tab/all/<current_page>/')
def list_all(current_page):
    feedback_page = Feedback.query.order_by(Feedback.created_at.desc()).paginate(int(current_page),per_page)
    feedbacks = feedback_page.items
    has_next = feedback_page.has_next
    return render_template('main/feedbacks.jade',feedbacks = feedbacks, has_next = has_next, next_page = int(current_page)+1, tab_name = 'all')

@app.route('/tab/web/<current_page>/')
def list_web(current_page):
    return list_tab(1, int(current_page),tab_name='web')

@app.route('/tab/mobile/<current_page>/')
def list_mobile(current_page):
    return list_tab(2, int(current_page),tab_name='mobile')

@app.route('/tab/dev/<current_page>/')
def list_dev(current_page):
    return list_tab(3, int(current_page),tab_name='dev')

@app.route('/tab/etc/<current_page>/')
def list_etc(current_page):
    return list_tab(4, int(current_page),tab_name='etc')

@app.route('/propose/')
def propose():
    return render_template('main/propose.jade', title='제안하기',this_year=this_year)

@app.route('/vote/<feedback_id>/', methods=['POST'])
def vote(feedback_id):
    ip_addr = request.remote_addr
    if VoteInfo.query.filter_by(feedback_id=feedback_id, ip_addr=ip_addr).first() == None:
       voteInfo = VoteInfo(feedback_id, ip_addr)
       db.session.add(voteInfo)
       db.session.commit()
    feedback = Feedback.query.get(feedback_id)
    return jsonify(feedback_id = feedback_id, vote_count = feedback.vote_count())

@app.route('/add_feedback', methods=['POST'])
def add_feedback():
    feedback = Feedback(request.form['email'], request.form['content'], request.form['propose_type'], datetime.now())
    db.session.add(feedback)
    db.session.commit()
    return redirect(url_for('list'))


