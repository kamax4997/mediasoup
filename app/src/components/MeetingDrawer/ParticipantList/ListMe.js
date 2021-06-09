import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withRoomContext } from '../../../RoomContext';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import * as appPropTypes from '../../appPropTypes';
import { useIntl } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import PanIcon from '@material-ui/icons/PanTool';
import EmptyAvatar from '../../../images/avatar-empty.jpeg';
import FixedSpotLightIcon from '@material-ui/icons/AspectRatio';
import { green } from '@material-ui/core/colors';


const styles = (theme) =>
	({
		root :
		{
			width    : '100%',
			overflow : 'hidden',
			cursor   : 'auto',
			display  : 'flex'
		},
		avatar :
		{
			borderRadius : '50%',
			height       : '2rem',
			marginTop    : theme.spacing(0.5)
		},
		peerInfo :
		{
			fontSize    : '.7rem',
			display     : 'flex',
			paddingLeft : theme.spacing(.7),
			flexGrow    : 1,
			alignItems  : 'center'
		},
		buttons :
		{
			padding : theme.spacing(.7)
		},
		green :
		{
			color : 'rgba(0, 153, 0, 1)'
		}
	});

const ListMe = (props) =>
{
	const intl = useIntl();

	const {
		roomClient,
		roles,
		me,
		myId,
		settings,
		classes
	} = props;

	const picture = me.picture || EmptyAvatar;
	console.log("roles: "+ roles)
	return (
		<div className={classes.root}>
			<img alt='My avatar' className={classes.avatar} src={picture} />

			<div className={classes.peerInfo}>
				{settings.displayName}
			</div>
			{ roles.indexOf('moderator')>-1 &&
				<Tooltip
					title={intl.formatMessage({
						id             : 'tooltip.muteParticipantVideoModerator',
						defaultMessage : 'Fixed Spotlight'
					})}
					placement='bottom'
				>
					<IconButton
						className={classes.buttons}
						style={{ color: green[500] }}
						
						onClick={(e) =>
						{
							e.stopPropagation();

							roomClient.setFixedPeer(myId);
						}}
					>
							<FixedSpotLightIcon />
					</IconButton>
				</Tooltip>
			}
			<Tooltip
				title={intl.formatMessage({
					id             : 'tooltip.raisedHand',
					defaultMessage : 'Raise hand'
				})}
				placement='bottom'
			>
				<IconButton
					aria-label={intl.formatMessage({
						id             : 'tooltip.raisedHand',
						defaultMessage : 'Raise hand'
					})}
					className={
						classnames(me.raisedHand ? classes.green : null, classes.buttons)
					}
					disabled={me.raisedHandInProgress}
					color='primary'
					onClick={(e) =>
					{
						e.stopPropagation();

						roomClient.setRaisedHand(!me.raisedHand);
					}}
				>
					<PanIcon />
				</IconButton>
			</Tooltip>
	
		
		</div>
		
	);
};

ListMe.propTypes =
{
	roomClient : PropTypes.object.isRequired,
	me         : appPropTypes.Me.isRequired,
	myId       : PropTypes.string.isRequired,
	roles 	   : PropTypes.object.isRequired,
	settings   : PropTypes.object.isRequired,
	classes    : PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
	me       : state.me,
	myId     : state.me.id,
	roles	 : state.me.roles,
	settings : state.settings
});

export default withRoomContext(connect(
	mapStateToProps,
	null,
	null,
	{
		areStatesEqual : (next, prev) =>
		{
			return (
				prev.me === next.me &&
				prev.settings === next.settings
			);
		}
	}
)(withStyles(styles)(ListMe)));
