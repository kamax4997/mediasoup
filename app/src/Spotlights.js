import { EventEmitter } from 'events';
import Logger from './Logger';

const logger = new Logger('Spotlight');

export default class Spotlights extends EventEmitter
{
	constructor(maxSpotlights, signalingSocket)
	{
		super();

		this._signalingSocket = signalingSocket;
		this._maxSpotlights = maxSpotlights;
		this._peerList = [];
		this._unmutablePeerList = [];
		this._selectedSpotlights = [];
		this._fixedSpotlight = [];
		this._currentSpotlights = [];
		this._started = false;
		this._page = 0;
		this._roomType = "";
	}

	start()
	{
		this._handleSignaling();

		this._started = true;
		this._spotlightsUpdated();
	}

	addPeers(peers)
	{
		for (const peer of peers)
		{
			this._newPeer(peer.id);
		}
	}

	setPage(pageNum)
	{
		this._page = pageNum;
		this._spotlightsUpdated();
	}

	setRoomType(roomType)
	{
		console.log('setting roomType: '+ roomType);
		this._roomType = roomType;
		//this._spotlightsUpdated();
	}
	
	getPage(pageNum)
	{
		return this._page;
	}
	peerInSpotlights(peerId)
	{
		if (this._started)
		{
			return this._currentSpotlights.indexOf(peerId) !== -1;
		}
		else
		{
			return false;
		}
	}
    getCurrent(){
		return this._currentSpotlights;

	}
	getNextAsSelected(peerId)
	{
		let newSelectedPeer = null;

		if (peerId == null && this._unmutablePeerList.length > 0)
		{
			peerId = this._unmutablePeerList[0];
		}

		if (peerId != null && this._currentSpotlights.length < this._unmutablePeerList.length)
		{
			const oldIndex = this._unmutablePeerList.indexOf(peerId);

			let index = oldIndex;

			index++;
			for (let i = 0; i < this._unmutablePeerList.length; i++)
			{
				if (index >= this._unmutablePeerList.length)
				{
					index = 0;
				}
				newSelectedPeer = this._unmutablePeerList[index];
				if (!this._currentSpotlights.includes(newSelectedPeer))
				{
					break;
				}
				index++;
			}
		}

		return newSelectedPeer;
	}

	getPrevAsSelected(peerId)
	{
		let newSelectedPeer = null;

		if (peerId == null && this._unmutablePeerList.length > 0)
		{
			peerId = this._unmutablePeerList[0];
		}

		if (peerId != null && this._currentSpotlights.length < this._unmutablePeerList.length)
		{
			const oldIndex = this._unmutablePeerList.indexOf(peerId);

			let index = oldIndex;

			index--;
			for (let i = 0; i < this._unmutablePeerList.length; i++)
			{
				if (index < 0)
				{
					index = this._unmutablePeerList.length - 1;
				}
				newSelectedPeer = this._unmutablePeerList[index];
				if (!this._currentSpotlights.includes(newSelectedPeer))
				{
					break;
				}
				index--;
			}
		}

		return newSelectedPeer;
	}

	setPeerSpotlight(peerId)
	{
		logger.debug('setPeerSpotlight() [peerId:"%s"]', peerId);

		const index = this._selectedSpotlights.indexOf(peerId);
		if(peerId != 'none'){
			if (index !== -1)
			{
				this._selectedSpotlights = [];
			}
			else
			{
				this._selectedSpotlights = [ peerId ];
			}
		}
		/*
		if (index === -1) // We don't have this peer in the list, adding
		{
			this._selectedSpotlights.push(peerId);
		}
		else // We have this peer, remove
		{
			this._selectedSpotlights.splice(index, 1);
		}
		*/

		if (this._started)
			this._spotlightsUpdated();
	}

	setFixedSpotlight(peerId)
	{
		logger.debug('setPeerSpotlight() [peerId:"%s"]', peerId);

		if(peerId != 'none') {

		const index = this._selectedSpotlights.indexOf(peerId);

		
				this._selectedSpotlights = [ peerId ];
		
			this._fixedSpotlight = [  ];
		}
		
        console.log("this._roomType: spotlights after fixed " + this._selectedSpotlights);
		/*
		if (index === -1) // We don't have this peer in the list, adding
		{
			this._selectedSpotlights.push(peerId);
		}
		else // We have this peer, remove
		{
			this._selectedSpotlights.splice(index, 1);
		}
		*/

		if (this._started)
			this._spotlightsUpdated();
	}
	
	_handleSignaling()
	{
		this._signalingSocket.on('notification', (notification) =>
		{
			if (notification.method === 'newPeer')
			{
				const { id } = notification.data;

				this._newPeer(id);
			}

			if (notification.method === 'peerClosed')
			{
				const { peerId } = notification.data;

				this._closePeer(peerId);
			}
		});
	}

	clearSpotlights()
	{
		this._started = false;

		this._peerList = [];
		this._selectedSpotlights = [];
		this._currentSpotlights = [];
		console.log("this._roomType: clear spotlights ");
	}

	_newPeer(id)
	{
		logger.debug(
			'room "newpeer" event [id: "%s"]', id);

		if (this._peerList.indexOf(id) === -1) // We don't have this peer in the list
		{
			logger.debug('_handlePeer() | adding peer [peerId: "%s"]', id);

			this._peerList.push(id);
			this._unmutablePeerList.push(id);

			if (this._started)
				this._spotlightsUpdated();
		}
	}

	_closePeer(id)
	{
		logger.debug(
			'room "peerClosed" event [peerId:%o]', id);

		this._peerList = this._peerList.filter((peer) => peer !== id);
		this._unmutablePeerList = this._unmutablePeerList.filter((peer) => peer !== id);

		this._selectedSpotlights = this._selectedSpotlights.filter((peer) => peer !== id);

		if (this._started)
			this._spotlightsUpdated();
	}

	addSpeakerList(speakerList)
	{
		this._peerList = [ ...new Set([ ...speakerList, ...this._peerList ]) ];

		if (this._started)
			this._spotlightsUpdated();
	}

	handleActiveSpeaker(peerId)
	{
		logger.debug('handleActiveSpeaker() [peerId:"%s"]', peerId);

		const index = this._peerList.indexOf(peerId);

		if (index > -1)
		{
			this._peerList.splice(index, 1);
			this._peerList = [ peerId ].concat(this._peerList);

			this._spotlightsUpdated();
		}
	}
	
	getPeersLength(){
		return this._peerList.length;


	}
	_spotlightsUpdated()
	{
		let spotlights;

		if (this._selectedSpotlights.length > 0)
		{
			spotlights = [ ...new Set([ ...this._selectedSpotlights, ...this._peerList ]) ];
		}
		else
		{
			spotlights = this._peerList;
		}
		var start = this._page * this._maxSpotlights;
		var end = start + this._maxSpotlights;
		if(end > this._peerList.length) { end = this._peerList.length;}
		if (
			!this._arraysEqual(
				this._currentSpotlights, spotlights.slice(start, end)
			)
		)
		{
			logger.debug('_spotlightsUpdated() | spotlights updated, emitting');

			this._currentSpotlights = spotlights.slice(start, end);
			console.log("varun this._roomType: spotlights "+this._selectedSpotlights);
			console.log("varun this._roomType: before "+this._currentSpotlights);
			console.log("varun this._roomType: fixed "+this._fixedSpotlight);
			
			//if(this._roomType == 'filmstrip'){
				spotlights = [...this._currentSpotlights, ...this._selectedSpotlights, ...this._fixedSpotlight ];
				this._currentSpotlights = spotlights;
				console.log("varun this._roomType: after "+this._currentSpotlights);
			
			//}
			this.emit('spotlights-updated', this._currentSpotlights);
		}
		else
			logger.debug('_spotlightsUpdated() | spotlights not updated');
	}

	_arraysEqual(arr1, arr2)
	{
		if (arr1.length !== arr2.length)
			return false;

		for (let i = arr1.length; i--;)
		{
			if (arr1[i] !== arr2[i])
				return false;
		}

		return true;
	}

	get maxSpotlights()
	{
		return this._maxSpotlights;
	}

	set maxSpotlights(maxSpotlights)
	{
		const oldMaxSpotlights = this._maxSpotlights;
		
		this._maxSpotlights = maxSpotlights;

		if (oldMaxSpotlights !== this._maxSpotlights)
			{
				this._page = 0;
				this._spotlightsUpdated();
			}
	}
}
