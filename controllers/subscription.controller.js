import Subscription from "../models/subscription.model.js";
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from "../config/env.js";
import dayjs from 'dayjs';

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    })

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    })

    res.status(201).json({ success: true, data: subscription, workflowRunId });
  } catch (error) {
    next(error);
  }
}

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if(req.user.id.toString() !== req.params.id.toString()) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
}

export const updateSubscription = async (req, res, next) => {
  try {
    const { service, price, renewalDate } = req.body;

    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { service, price, renewalDate },
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all subscriptions
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id });
    res.status(200).json({ success: true, subscriptions });
  } catch (error) {
    next(error);
  }
};

// Get a specific subscription
export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

// Cancel a subscription (soft delete example)
export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Authorization check: Ensure user owns the subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this subscription' });
    }

    // Check if already cancelled
    if (subscription.isCancelled || subscription.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Subscription is already cancelled' });
    }

    // Update subscription status
    subscription.isCancelled = true;
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription,
    });
  } catch (error) {
    console.error('Cancel Subscription Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get upcoming renewals
export const getUpcomingRenewals = async (req, res) => {
  try {
    // Calculate today's date and date seven days from now
    const today = dayjs().startOf('day').toDate();
    const sevenDaysLater = dayjs().add(7, 'day').endOf('day').toDate();

    // Fetch subscriptions with renewal dates within the next 7 days for the authenticated user
    const subscriptions = await Subscription.find({
      user: req.user._id, // Only fetch subscriptions belonging to the logged-in user
      renewalDate: { $gte: today, $lte: sevenDaysLater },
      status: 'active', // Only consider active subscriptions
    }).sort({ renewalDate: 1 }); // Sort by soonest renewal

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
