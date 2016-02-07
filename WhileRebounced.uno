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
                        BypassSetActive(true);
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

        void OnScrollPositionChanged(object sender, Uno.EventArgs args)
        {
                float y = _scrollable.ScrollPosition.Y;
                if (y < 0) _topBounce = true;
                else if (y == 0 && _topBounce) _rebounced = true;
                else
                {
                        _topBounce = false;
                        _rebounced = false;
                }
                SetActive(_rebounced);
        }
}