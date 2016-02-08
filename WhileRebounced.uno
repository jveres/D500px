using Uno;
using Fuse;
using Fuse.Controls;
using Fuse.Triggers;

public class WhileRebounced : WhileTrigger
{
        ScrollView _scrollable;

        protected override void OnRooted(Node parentNode)
        {
                base.OnRooted(parentNode);
                _scrollable = ParentNode as ScrollView;
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

        bool _topBounce = true; // initial state
        bool _rebounced = false;

        void OnScrollPositionChanged(object sender, EventArgs args)
        {
                SetActive(IsOn);
        }

        public bool IsOn
        {
                get
                {
                        var mn = _scrollable.MinScroll;
                        var p = _scrollable.ScrollPosition;
                        if (p.Y < mn.Y) _topBounce = true;
                        else if (p.Y == mn.Y && _topBounce) _rebounced = true;
                        else
                        {
                                _topBounce = false;
                                _rebounced = false;
                        }
                        return _rebounced;
                }
        }
}