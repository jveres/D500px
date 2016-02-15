using Uno;
using Fuse;
using Fuse.Controls;
using Fuse.Gestures;
using Fuse.Triggers;

public class WhileRebounced : WhileTrigger
{
        public ScrollDirections ScrollDirections { get; set; }

        ScrollView _scrollable;

        protected override void OnRooted(Node parentNode)
        {
                base.OnRooted(parentNode);
                _scrollable = ParentNode.FindByType<ScrollView>();
                if (_scrollable != null)
                {
                        _scrollable.ScrollPositionChanged += OnScrollPositionChanged;
                        BypassSetActive(IsOn);
                }
        }

        protected override void OnUnrooted(Node parentNode)
        {
                if (_scrollable != null)
                {
                        _scrollable.ScrollPositionChanged -= OnScrollPositionChanged;
                        _scrollable = null;
                }
                base.OnUnrooted(parentNode);
        }

        // initial state
        bool _topBounce = true;
        bool _bottomBounce = true;
        bool _rebounced = false;

        void OnScrollPositionChanged(object sender, EventArgs args)
        {
                SetActive(IsOn);
        }

        static float ZeroTolerance = 0.01f;

        public bool IsOn
        {
                get
                {
                        var mn = _scrollable.MinScroll;
                        var mx = _scrollable.MaxScroll;
                        var p = _scrollable.ScrollPosition;
                        //debug_log "p="+p+" mx="+mx+" mn="+mn;
                        if      (p.Y < mn.Y) _topBounce = true;
                        else if (p.Y - ZeroTolerance > mx.Y) _bottomBounce = true;
                        else if (ScrollDirections.HasFlag(ScrollDirections.Down) && (p.Y - mn.Y == 0) && _topBounce) _rebounced = true;
                        else if (ScrollDirections.HasFlag(ScrollDirections.Up) && (Math.Abs(mx.Y - p.Y) < ZeroTolerance) && _bottomBounce) _rebounced = true;
                        else
                        {
                                _topBounce = false;
                                _bottomBounce = false;
                                _rebounced = false;
                        }
                        return _rebounced;
                }
        }
}