import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import * as appPropTypes from '../../appPropTypes';
import { withRoomContext } from '../../../RoomContext';
import { useIntl, FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { spacing } from '@material-ui/system';

const styles = (theme) =>
	({
		root :
		{
			padding : theme.spacing(.5),
			display : 'flex'
		},
		divider :
		{
			marginLeft : theme.spacing(1)
		}
	});

const ListModerator = (props) =>
{
	const intl = useIntl();

	const {
		roomClient,
		room,
		me,
		peer,
		classes
	} = props;

const lockTooltip = !room.silenced ?
	intl.formatMessage({
		id             : 'tooltip.unLockRoom',
		defaultMessage : 'Silence lock room'
	})
	:
	intl.formatMessage({
		id             : 'tooltip.lockRoom',
		defaultMessage : 'Remove silence lock'
	});	
	
	return (
		<div className={classes.root}>
			<Tooltip
				title={intl.formatMessage({
					id             : 'room.muteAll',
					defaultMessage : 'Mute All'
				})}
			>
			<Button
				aria-label={intl.formatMessage({
					id             : 'room.muteAll',
					defaultMessage : 'Mute all'
				})}
				variant='contained'
				color='default'
				size="small"
				disabled={room.muteAllInProgress}
				onClick={() => roomClient.muteAllPeers()}
			>
				<VolumeOffIcon fontSize="small"></VolumeOffIcon>

				<div className={classes.divider} />
				
			<Tooltip title={lockTooltip}>
							<span className={classes.disabledButton}>
								<IconButton
									aria-label={lockTooltip}
									className={classes.actionButton}
									color='inherit'
									size="small"
									onClick={(e) =>
									{
										e.stopPropagation();  
										if (room.silenced)
										{
											roomClient.unsilenceRoom();
										}
										else
										{
											roomClient.silenceRoom();
										}
									}}
								>
									{ room.silenced ?
										<LockIcon fontSize="small" />
										:
										<LockOpenIcon />
									}
								</IconButton>
							</span>
						</Tooltip>
			
			</Button>
		
			</Tooltip>
		
					<div className={classes.divider} />
			<Tooltip
				title={intl.formatMessage({
					id             : 'room.stopAllVideo',
					defaultMessage : 'Stop all video'
				})}
			>

			<Button
				aria-label={intl.formatMessage({
					id             : 'room.stopAllVideo',
					defaultMessage : 'Stop all video'
				})}
				variant='contained'
				color='default'
				size="small"
				disabled={room.stopAllVideoInProgress}
				onClick={() => roomClient.stopAllPeerVideo()}
			>
				<VideocamOffIcon fontSize="small"></VideocamOffIcon>
			</Button>
			</Tooltip>
				<div className={classes.divider} />
			<Tooltip
				title={intl.formatMessage({
					id             : 'room.removeSpotLight',
					defaultMessage : 'Remove Spotlight'
				})}
			>
			<Button
				aria-label={intl.formatMessage({
					id             : 'room.removeSpotLight',
					defaultMessage : 'Remove Spotlight'
				})}
				variant='contained'
				color='default'
				size="small"
				disabled={room.stopAllVideoInProgress}
				onClick={() => roomClient.setFixedPeer("none")}
			>
				<CancelPresentationIcon fontSize="small"></CancelPresentationIcon>
			</Button>
			</Tooltip>
				<div className={classes.divider} />
			<Tooltip
				title={intl.formatMessage({
					id             : 'room.stopAllScreenSharing',
					defaultMessage : 'Stop all screen sharing'
				})}
			>	
			<Button
				aria-label={intl.formatMessage({
					id             : 'room.stopAllScreenSharing',
					defaultMessage : 'Stop all screen sharing'
				})}
				variant='contained'
				color='default'
				size="small"
				disabled={room.stopAllScreenSharingInProgress}
				onClick={() => roomClient.stopAllPeerScreenSharing()}
			>
				<StopScreenShareIcon fontSize="small"></StopScreenShareIcon>
			</Button>
			</Tooltip>
			<div className={classes.divider} />
			<Tooltip
				title={intl.formatMessage({
					id             : 'room.closeMeeting',
					defaultMessage : 'Close meeting'
				})}
			>
			<Button
				aria-label={intl.formatMessage({
					id             : 'room.closeMeeting',
					defaultMessage : 'Close meeting'
				})}
				variant='contained'
				color='default'
				size="small"
				disabled={room.closeMeetingInProgress}
				onClick={() => roomClient.closeMeeting()}
			>
				<PowerSettingsNewIcon fontSize="small"></PowerSettingsNewIcon>
			</Button>
			</Tooltip>
		</div>
	);
};

ListModerator.propTypes =
{
	roomClient : PropTypes.any.isRequired,
	room       : PropTypes.object.isRequired,
	me         : appPropTypes.Me.isRequired,
	peer       : appPropTypes.Peer.isRequired,
	classes    : PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
	room : state.room,
	me       : state.me,
});

export default withRoomContext(connect(
	mapStateToProps,
	null,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.room === next.room
			);
		}
	}
)(withStyles(styles)(ListModerator)));